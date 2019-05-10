import React, {useState} from "react";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import {isEmpty} from "lodash";
import {actions} from "../actions";
import {connect} from "react-redux";
import axios from "axios";
import IconButton from "@material-ui/core/IconButton";
import {withStyles} from "@material-ui/core";

const styles = theme => ({});

// isBookmarked and setBookmark are from the redux store
const Bookmark = ({classes, isLoggedIn, toggleLoginModal, paperId, saved_in_library, isBookmarked, setBookmark, color}) => {
  const [stateBookmark, setStateBookmark] = useState(saved_in_library);
  const value = stateBookmark !== undefined ? stateBookmark : isBookmarked;

  const handleBookmarkClick = () => {
    if (!isLoggedIn) {
      toggleLoginModal('Please login to save bookmarks');
      return;
    }
    // Save in database via backend
    axios.post(`/library/${paperId}/${value ? 'remove' : 'save'}`)
      .then(res => {
        if (stateBookmark !== undefined) {
          setStateBookmark(!stateBookmark)
        } else {
          setBookmark(!isBookmarked)
        }
      })
      .catch(err => console.log(err.response))
  }

  return (
    <IconButton
      onClick={() => handleBookmarkClick()}
    >
      { value ? <StarIcon style={{color}} /> : <StarBorderIcon style={{color}}/>}
    </IconButton>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    isBookmarked: state.paper.isBookmarked
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleLoginModal: (message) => {
      dispatch(actions.toggleLoginModal(message));
    },
    setBookmark: (value) => {
      dispatch(actions.setBookmark(value));
    },
  }
}

const withRedux = connect(mapStateToProps, mapDispatchToProps);

export default withRedux(withStyles(styles)(Bookmark));
