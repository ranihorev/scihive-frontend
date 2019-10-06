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

interface BookmarkProps {
  isBookmarked?: boolean;
  color?: string | undefined;
  size?: SvgIconProps['fontSize'];
  paperId: string;
  position?: 'right' | 'center' | 'left';
  selectedGroupIds: string[];
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
  color = undefined,
  size = 'inherit',
  position = 'right',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<Element>();
  const handleClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please login to save bookmarks');
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton onClick={handleClick}>
        <AddToListIcon
          style={css`
            width: 18px;
          `}
          fill="rgba(0, 0, 0, 0.8)"
        />
      </IconButton>
      <Popover
        id="simple-popper"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: position,
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: position,
        }}
        css={css`
          > .MuiPopover-paper {
            max-height: 200px;
            overflow-y: auto;
            width: 200px;
          }
        `}
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
                onChange={(e, checked) => setBookmark(paperId, checked)}
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
                      updatePaperGroup({ paperId, groupId: group.id, shouldAdd: !selected });
                    }}
                    checked={selected}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Popover>
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
