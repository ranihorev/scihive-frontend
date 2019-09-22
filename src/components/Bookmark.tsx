import React, { useState } from 'react';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import axios from 'axios';
import { IconButton, Tooltip } from '@material-ui/core';
import { actions } from '../actions';
import { Dispatch } from 'redux';
import { RootState } from '../models';

interface BookmarkProps {
  isLoggedIn: boolean;
  toggleLoginModal: (msg?: string) => void;
  paperId: string;
  saved_in_library: boolean;
  isBookmarked: boolean;
  setBookmark: (value: boolean) => void;
  color?: string | undefined;
  selectedColor: string;
  blinkLibraryBadge: () => void;
}

// isBookmarked and setBookmark are from the redux store
const Bookmark: React.FC<BookmarkProps> = ({
  isLoggedIn,
  toggleLoginModal,
  paperId,
  saved_in_library,
  isBookmarked,
  setBookmark,
  color = undefined,
  selectedColor,
  blinkLibraryBadge,
}) => {
  const [stateBookmark, setStateBookmark] = useState(saved_in_library);
  const value = stateBookmark !== undefined ? stateBookmark : isBookmarked;

  const handleBookmarkClick = () => {
    if (!isLoggedIn) {
      toggleLoginModal('Please login to save bookmarks');
      return;
    }
    // Save in database via backend
    axios
      .post(`/library/${paperId}/${value ? 'remove' : 'save'}`)
      .then(() => {
        if (stateBookmark !== undefined) {
          // List view
          setStateBookmark(!stateBookmark);
          if (!stateBookmark) blinkLibraryBadge();
        } else {
          // Paper view
          setBookmark(!isBookmarked);
        }
      })
      .catch(err => console.log(err.response));
  };

  return (
    <Tooltip title="Add to Library" placement="bottom">
      <span>
        <IconButton onClick={() => handleBookmarkClick()}>
          {value ? <StarIcon style={{ color: selectedColor || color }} /> : <StarBorderIcon style={{ color }} />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    isBookmarked: state.paper.isBookmarked,
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
    blinkLibraryBadge: () => {
      dispatch(actions.blinkLibrary());
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Bookmark);
