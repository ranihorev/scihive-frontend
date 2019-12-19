/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton, Input, List, ListItem } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import Color from 'color';
import { isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { actions } from '../actions';
import { AddToListIcon } from '../icons/addToList';
import { Group, RootState } from '../models';
import { addRemovePaperToGroup, bookmarkPaper, createNewGroup, editGroup } from '../thunks';
import { presets } from '../utils';
import { BASE_GROUP_COLOR, GROUP_COLORS, smallIconPadding, COLORS } from '../utils/presets';
import { ArrowTooltip } from './ArrowTooltip';
import { EditGroup } from './GroupsList';
import { PopoverMenu } from './PopoverMenu';

interface BookmarkProps {
  isBookmarked?: boolean;
  color?: string | undefined;
  size?: number;
  paperId: string;
  position?: 'right' | 'center' | 'left';
  selectedGroupIds: string[];
  type: 'single' | 'list';
}

interface BookmarkStateProps {
  isLoggedIn: boolean;
  isBookmarked: boolean;
  groups: Group[];
}

interface BookmarkDispatchProps {
  toggleLoginModal: (msg?: string) => void;
  setBookmark: (...args: Parameters<typeof bookmarkPaper>) => void;
  updatePaperGroup: (...args: Parameters<typeof addRemovePaperToGroup>) => void;
  createGroup: (...args: Parameters<typeof createNewGroup>) => void;
  editGroup: (...args: Parameters<typeof editGroup>) => void;
}

const NewGroup: React.FC<{ createGroup: BookmarkDispatchProps['createGroup'] }> = ({ createGroup }) => {
  const [value, setValue] = React.useState('');
  const submitGroup = () => {
    if (isEmpty(value)) return;
    createGroup({ name: value, onSuccessCb: () => setValue('') });
  };
  return (
    <ListItem
      css={css`
        border-top: 1px solid #cecece;
      `}
    >
      <Input
        value={value}
        placeholder="New list"
        onChange={e => {
          setValue(e.target.value);
        }}
        onKeyPress={e => {
          if (e.key === 'Enter') submitGroup();
        }}
        inputProps={{ style: { padding: '3px 0 4px' } }}
        fullWidth
      />
      <i
        className="fas fa-plus"
        css={css`
          font-size: 17px;
          cursor: pointer;
          margin-left: 5px;
          margin-right: 2px;
          color: #a5a5a5;
        `}
        onClick={() => submitGroup()}
      />
    </ListItem>
  );
};

interface GroupRenderProps {
  group: Group;
  selected: boolean;
  type: BookmarkProps['type'];
  paperId: string;
  updatePaperGroup: BookmarkDispatchProps['updatePaperGroup'];
  onEdit: () => void;
}

const baseGroupCss = css`
  ${presets.row};
  align-items: center;
  flex-grow: 1;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  min-height: 20px;
  padding: 7px;
`;

const GroupRender: React.FC<GroupRenderProps> = ({ group, selected, paperId, type, updatePaperGroup, onEdit }) => {
  let backgroundHoverColor;
  const backgroundColor = GROUP_COLORS[group.color || BASE_GROUP_COLOR];
  try {
    backgroundHoverColor = Color(backgroundColor);
  } catch (e) {
    backgroundHoverColor = Color(GROUP_COLORS[BASE_GROUP_COLOR]);
  }
  backgroundHoverColor = backgroundHoverColor.darken(0.1).string();
  return (
    <ListItem key={group.id}>
      <div
        css={css`
          ${presets.row};
          width: 100%;
          align-items: center;
        `}
      >
        <div
          css={css`
            ${baseGroupCss};
            background-color: ${backgroundColor};
            &:hover {
              background-color: ${backgroundHoverColor};
            }
          `}
          onClick={() => {
            updatePaperGroup({ type, paperId, groupId: group.id, shouldAdd: !selected });
          }}
        >
          <div
            css={css`
              word-break: break-word;
            `}
          >
            {group.name}
          </div>
          {selected && <DoneIcon fontSize="small" />}
        </div>
        <div
          css={css`
            cursor: pointer;
            color: #a5a5a5;
            &:hover {
              color: black;
            }
          `}
          onClick={() => onEdit()}
        >
          <CreateIcon
            css={css`
              font-size: 14px;
              padding: 5px 0 5px 5px;
            `}
          />
        </div>
      </div>
    </ListItem>
  );
};

// isBookmarked and setBookmark are from the redux store
const Bookmark: React.FC<BookmarkProps & BookmarkStateProps & BookmarkDispatchProps> = ({
  isLoggedIn,
  toggleLoginModal,
  isBookmarked,
  selectedGroupIds,
  groups,
  paperId,
  setBookmark,
  updatePaperGroup,
  color = COLORS.grey,
  size = 18,
  type,
  createGroup,
  editGroup,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [groupInEdit, setGroupInEdit] = React.useState<Group | undefined>(undefined);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const timeoutId = React.useRef<NodeJS.Timeout>();
  const [isListsTooltipOpen, setIsListsTooltipOpen] = React.useState(false);

  const onListsClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please log in to save manage lists and bookmarks');
      return;
    }
    setIsOpen(true);
  };

  const clearTimeoutHelper = () => {
    if (timeoutId.current !== undefined) {
      clearTimeout(timeoutId.current);
      timeoutId.current = undefined;
    }
  };

  React.useEffect(() => {
    return () => clearTimeoutHelper();
  }, []);

  const setBookmarkWrapper = (...args: Parameters<typeof setBookmark>) => {
    setIsListsTooltipOpen(true);

    timeoutId.current = setTimeout(() => {
      setIsListsTooltipOpen(false);
    }, 5000);
    setBookmark(...args);
  };

  const Star = isBookmarked ? StarIcon : StarBorderIcon;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: ${type === 'single' ? 'row-reverse' : 'column'};
      `}
    >
      <div {...(!isBookmarked ? { 'data-rh': 'Add to my library' } : {})} data-rh-at="left">
        <IconButton onClick={() => setBookmarkWrapper(type, paperId, !isBookmarked)} buttonRef={anchorRef} size="small">
          <Star style={{ width: size, height: size, color, padding: smallIconPadding }} />
        </IconButton>
      </div>
      {isBookmarked && (
        <div {...(timeoutId.current === undefined ? { 'data-rh': 'Add to lists' } : {})} data-rh-at="left">
          <ArrowTooltip
            open={isListsTooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            placement="left"
            title="Add to lists"
          >
            <IconButton onClick={onListsClick} buttonRef={anchorRef} size="small">
              <AddToListIcon
                style={css`
                  width: ${size}px;
                  height: ${size}px;
                  padding: ${smallIconPadding}px;
                `}
                fill={color}
              />
            </IconButton>
          </ArrowTooltip>
        </div>
      )}
      <div />
      <PopoverMenu
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        contentCss={css`
          width: 230px;
        `}
      >
        {groupInEdit ? (
          <EditGroup group={groupInEdit} editGroup={editGroup} onFinishEdit={() => setGroupInEdit(undefined)} />
        ) : (
          <React.Fragment>
            <List
              dense
              css={css`
                max-height: 250px;
                overflow-y: auto;
                width: 100%;
              `}
            >
              {isEmpty(groups) && (
                <ListItem>
                  <div
                    css={css`
                      font-size: 14px;
                      color: #333;
                      line-height: 1.5;
                    `}
                  >
                    Add lists to organize your papers according to topics or collaborators you wish to share the list
                    with
                  </div>
                </ListItem>
              )}
              {groups.map(group => {
                const selected = selectedGroupIds.some(id => id === group.id);
                return (
                  <GroupRender
                    key={group.id}
                    {...{ group, paperId, type, selected, updatePaperGroup }}
                    onEdit={() => setGroupInEdit(group)}
                  />
                );
              })}
            </List>
            <NewGroup createGroup={createGroup} />
          </React.Fragment>
        )}
      </PopoverMenu>
    </div>
  );
};

const mapStateToProps = (state: RootState, props: BookmarkProps) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    isBookmarked: props.isBookmarked !== undefined ? props.isBookmarked : state.paper.isBookmarked,
    groups: state.user.groups,
  };
};

const mapDispatchToProps = (dispatch: RTDispatch): BookmarkDispatchProps => {
  return {
    toggleLoginModal: message => {
      dispatch(actions.toggleLoginModal(message));
    },
    setBookmark: (...args) => {
      dispatch(bookmarkPaper(...args));
    },
    updatePaperGroup: payload => {
      dispatch(addRemovePaperToGroup(payload));
    },
    createGroup: payload => {
      dispatch(createNewGroup(payload));
    },
    editGroup: (id, payload) => {
      dispatch(editGroup(id, payload));
    },
  };
};

const withRedux = connect(mapStateToProps, mapDispatchToProps);

export default withRedux(Bookmark);
