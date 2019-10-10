/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  Checkbox,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Popper,
} from '@material-ui/core';
import { isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { actions } from '../actions';
import { AddToListIcon } from '../icons/addToList';
import { Group, RootState } from '../models';
import { addRemovePaperToGroup, bookmarkPaper, createNewGroup } from '../thunks';
import { useOnClickOutside } from '../utils/hooks';

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
}

const NewGroup: React.FC<{ createGroup: BookmarkDispatchProps['createGroup'] }> = ({ createGroup }) => {
  const [value, setValue] = React.useState('');
  const submitGroup = () => {
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
        `}
      />
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
  color = 'rgba(0, 0, 0, 0.8)',
  size = 18,
  type,
  createGroup,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const handleClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please log in to save manage lists and bookmarks');
      return;
    }
    setIsOpen(true);
  };

  useOnClickOutside(
    contentRef,
    () => {
      setIsOpen(false);
    },
    isOpen,
  );

  return (
    <div>
      <div data-rh="Add paper to list">
        <IconButton onClick={handleClick} buttonRef={anchorRef}>
          <AddToListIcon
            style={css`
              width: ${size}px;
              height: ${size}px;
            `}
            fill={color}
          />
        </IconButton>
      </div>
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        css={css`
          z-index: 1;
        `}
      >
        <Paper
          css={css`
            max-width: 250px;
          `}
          ref={contentRef}
        >
          <List
            dense
            css={css`
              max-height: 250px;
              overflow-y: auto;
              width: 100%;
              padding-bottom: 0;
            `}
          >
            <ListItem>
              <ListItemText primary="Starred" />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={(e, checked) => setBookmark(type, paperId, checked)}
                  checked={isBookmarked}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            {groups.map(group => {
              const selected = selectedGroupIds.some(id => id === group.id);
              return (
                <ListItem key={group.id}>
                  <ListItemText
                    primary={group.name}
                    css={css`
                      word-break: break-all;
                    `}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      onChange={(e, checked) => {
                        updatePaperGroup({ type, paperId, groupId: group.id, shouldAdd: !selected });
                      }}
                      checked={selected}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <NewGroup createGroup={createGroup} />
        </Paper>
      </Popper>
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
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Bookmark);
