import React, {useState} from "react";
import PropTypes from "prop-types";
import MenuItem from "@material-ui/core/MenuItem/index";
import Menu from "@material-ui/core/Menu/index";
import { withStyles } from "@material-ui/core/styles/index";
import { withRouter } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import Divider from "@material-ui/core/Divider";
import Bookmark from "../Bookmark";
import {actions} from "../../actions";
import {connect} from "react-redux";
import {isEmpty} from "lodash";

const styles = theme => ({
  unchangedText: {
    textTransform: "none",
    textDecoration: "none",
    color: "inherit",
    "&:focus": {
      outline: 'none',
    }
  },
  faIcon: {
    fontSize: '19px',
  }
});

const PaperMenuDekstopRender = ({classes, match: {params}, toggleGroupsModal, isLoggedIn}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const {PaperId} = params;

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Bookmark paperId={PaperId} color={'white'}/>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <CloudDownloadIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >

        <a
          href={`https://arxiv.org/pdf/${PaperId}.pdf?download=1`} // download=1 ensures that the extension will ignore the link
          className={classes.unchangedText}
          target="_blank"
          download={PaperId + ".pdf"}
        >
          <MenuItem onClick={handleMenuClose}>
            PDF
          </MenuItem>
        </a>
        <a
          href={`https://arxiv.org/e-print/${PaperId}`}
          className={classes.unchangedText}
          target="_blank"
          download
        >
          <MenuItem onClick={handleMenuClose}>
            LaTeX
          </MenuItem>
        </a>
      </Menu>
      {
        isLoggedIn ?
          <IconButton color="inherit" onClick={toggleGroupsModal}>
            <i className={`fas fa-users ${classes.faIcon}`}></i>
          </IconButton>
          : null
      }
    </React.Fragment>
  )

};

PaperMenuDekstopRender.propTypes = {
  classes: PropTypes.object.isRequired
};

const PaperMenuMobileRender = ({classes, match: {params}, handleMobileMenuClick, toggleGroupsModal, isLoggedIn}) => {
  const {PaperId} = params;

  return (
    <React.Fragment>
      <a
        href={`https://arxiv.org/pdf/${PaperId}.pdf?download=1`}
        className={classes.unchangedText}
        target="_blank"
        download={PaperId + ".pdf"}
        onClick={(e) => handleMobileMenuClick()}
      >
        <MenuItem>
          Download PDF
        </MenuItem>
      </a>
      <a
        href={`https://arxiv.org/e-print/${PaperId}`}
        className={classes.unchangedText}
        target="_blank"
        onClick={(e) => handleMobileMenuClick()}
        download
      >
        <MenuItem>
          Download LaTeX
        </MenuItem>
      </a>
      {
        isLoggedIn ?
          <MenuItem onClick={() => {handleMobileMenuClick(); toggleGroupsModal()}}>
            Groups
          </MenuItem>
          : null
      }
      <Divider />
    </React.Fragment>
  )

};


const mapStateToProps = (state, ownProps) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleGroupsModal: () => {
      dispatch(actions.toggleGroupsModal());
    },
  }
};

const withRedux = connect(mapStateToProps, mapDispatchToProps);

export const PaperDekstopMenu = withRedux(withStyles(styles)(withRouter(PaperMenuDekstopRender)));

export const PaperMobileMenu = withRedux(withStyles(styles)(withRouter(PaperMenuMobileRender)));
