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
import shallow from 'zustand/shallow';
import { AddToListIcon } from '../../icons/addToList';
import { Group } from '../../models';
import { useUserStore } from '../../stores/user';
import { AddRemoveBookmark, AddRemovePaperToGroup } from '../../stores/utils';
import { presets } from '../../utils';
import { BASE_GROUP_COLOR, COLORS, GROUP_COLORS, smallIconPadding } from '../../utils/presets';
import { ArrowTooltip } from '../ArrowTooltip';
import { PopoverMenu } from '../PopoverMenu';
import { EditGroup } from './EditGroup';

interface BookmarkProps {
  isBookmarked: boolean;
  setBookmark: (props: AddRemoveBookmark) => void;
  updatePaperGroup: (props: AddRemovePaperToGroup) => void;
  color?: string | undefined;
  size?: number;
  paperId: string;
  position?: 'right' | 'center' | 'left';
  selectedGroupIds: string[];
  type: 'single' | 'list';
}

const NewGroup: React.FC = () => {
  const [value, setValue] = React.useState('');
  const createGroup = useUserStore(state => state.newGroup);

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
  paperId: string;
  updatePaperGroup: (props: AddRemovePaperToGroup) => void;
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

const GroupRender: React.FC<GroupRenderProps> = ({ group, selected, paperId, updatePaperGroup, onEdit }) => {
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
            updatePaperGroup({ paperId, groupId: group.id, shouldAdd: !selected });
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

const Bookmark: React.FC<BookmarkProps> = ({
  isBookmarked,
  setBookmark,
  updatePaperGroup,
  selectedGroupIds,
  paperId,
  color = COLORS.grey,
  size = 18,
  type,
}) => {
  const { groups, isLoggedIn, toggleLoginModal } = useUserStore(
    state => ({ groups: state.groups, toggleLoginModal: state.toggleLoginModal, isLoggedIn: Boolean(state.userData) }),
    shallow,
  );

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

  const setBookmarkWrapper = () => {
    if (!isLoggedIn) {
      toggleLoginModal('Please log in to save manage lists and bookmarks');
      return;
    }
    setIsListsTooltipOpen(true);

    timeoutId.current = setTimeout(() => {
      setIsListsTooltipOpen(false);
    }, 5000);
    setBookmark({ paperId, checked: !isBookmarked });
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
        <IconButton onClick={() => setBookmarkWrapper()} buttonRef={anchorRef} size="small">
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
          <EditGroup group={groupInEdit} onFinishEdit={() => setGroupInEdit(undefined)} />
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
                    {...{ group, paperId, selected, updatePaperGroup }}
                    onEdit={() => setGroupInEdit(group)}
                  />
                );
              })}
            </List>
            <NewGroup />
          </React.Fragment>
        )}
      </PopoverMenu>
    </div>
  );
};

export default Bookmark;
