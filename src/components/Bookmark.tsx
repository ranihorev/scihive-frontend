/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  IconButton,
  List,
  Popover,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Popper,
  Paper,
} from '@material-ui/core';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import { AddToListIcon } from '../icons/addToList';
import { Group, RootState } from '../models';
import { bookmarkPaper, addRemovePaperToGroup } from '../thunks';
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
}

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
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const handleClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please login to save bookmarks');
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
      <div>
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
            max-height: 200px;
            overflow-y: auto;
            width: 200px;
          `}
          ref={contentRef}
        >
          <List
            dense
            css={css`
              width: 100%;
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
                  <ListItemText primary={group.name} />
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
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Bookmark);
