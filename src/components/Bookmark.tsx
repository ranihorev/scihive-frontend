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

interface BookmarkProps {
  isBookmarked?: boolean;
  color?: string | undefined;
  size?: SvgIconProps['fontSize'];
  paperId: string;
  position?: 'right' | 'center' | 'left';
}

interface BookmarkStateProps {
  isLoggedIn: boolean;
  isBookmarked: boolean;
  groups: Group[];
}

interface BookmarkDispatchProps {
  toggleLoginModal: (msg?: string) => void;
  setBookmark: (value: boolean) => void;
}

// isBookmarked and setBookmark are from the redux store
const Bookmark: React.FC<BookmarkProps & BookmarkStateProps & BookmarkDispatchProps> = ({
  isLoggedIn,
  toggleLoginModal,
  isBookmarked,
  groups,
  paperId,
  setBookmark,
  color = undefined,
  size = 'inherit',
  position = 'right',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<Element>();

  const handleBookmarkClick = (value: boolean) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please login to save bookmarks');
      return;
    }
  };
  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const open = Boolean(anchorEl);

  return (
    <React.Fragment>
      <IconButton onClick={handleClick}>
        <AddToListIcon
          style={css`
            width: 18px;
          `}
          fill="rgba(0, 0, 0, 0.54)"
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
            max-height: 150px;
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
          <ListItem button>
            <ListItemText primary="Starred" />
            <ListItemSecondaryAction>
              <Checkbox
                edge="end"
                onChange={(e, checked) => handleBookmarkClick(checked)}
                checked={isBookmarked}
                color="default"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Popover>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState, props: BookmarkProps) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    isBookmarked: props.isBookmarked !== undefined ? props.isBookmarked : state.paper.isBookmarked,
    groups: state.user.groups,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleLoginModal: (message?: string) => {
      dispatch(actions.toggleLoginModal(message));
    },
    setBookmark: (value: boolean) => {
      dispatch(actions.setBookmark(value));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Bookmark);
