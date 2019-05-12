import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import { withStyles } from "@material-ui/core/styles/index";
import {isEmpty} from "lodash";
import IconButton from "@material-ui/core/IconButton/index";
import MenuItem from "@material-ui/core/MenuItem/index";
import Menu from "@material-ui/core/Menu/index";
import MoreIcon from "@material-ui/icons/MoreVert";
import axios from "axios/index";
import {connect} from "react-redux";
import {actions} from "../../actions";
import Divider from "@material-ui/core/Divider";

const styles = theme => ({
  link: {
    textTransform: 'none',
    textDecoration: 'inherit',
    color: 'inherit',
    "&:focus": {
      outline: 'none',
    },
  }
});

const logout = () => {
  axios.post('/user/logout/access')
    .then(res => {
      localStorage.removeItem('username');
      window.location.href='/';
    })
    .catch(err => console.log(err.response))
};

const MobileMenuRender = ({rootChildren = null, submenuChildren = null, isLoggedIn, toggleLoginModal, classes}) => {
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const handleMobileMenuOpen = event => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileMenuClick = (cb=null) => {
    handleMobileMenuClose();
    if (cb) cb();
  };

  const submenuChildrenWithClose = React.Children.map(submenuChildren, child =>
    React.cloneElement(child, { handleMobileMenuClick }));

  return (
    <React.Fragment>
      {rootChildren}
      <IconButton
        aria-haspopup="true"
        onClick={handleMobileMenuOpen}
        color="inherit"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={mobileAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileAnchorEl)}
        onClose={handleMobileMenuClose}
      >
        {submenuChildrenWithClose}
        {
          isLoggedIn ?
            <Link to={"/library"} className={classes.link}>
              <MenuItem onClick={handleMobileMenuClose}>
                My library
              </MenuItem>
            </Link>
            : null
        }
        <Divider />
        <a
          href="https://chrome.google.com/webstore/detail/arxivcolab/dijdhkcfdaocpepndegmbkgphbpomdai"
          target="_blank"
          className={classes.link}
        >
          <MenuItem onClick={handleMobileMenuClose}>
            Chrome Extension
          </MenuItem>
        </a>
        <Link to={'/about'} className={classes.link}>
          <MenuItem color="inherit">
            About
          </MenuItem>
        </Link>
        <Divider />
        {
          isLoggedIn ?
            <MenuItem color="inherit" onClick={() => handleMobileMenuClick(logout)}>Logout</MenuItem> :
            <MenuItem color="inherit" onClick={() => handleMobileMenuClick(toggleLoginModal)}>Login</MenuItem>
        }
      </Menu>
    </React.Fragment>
  )
};

const DesktopMenuRender = ({children, isLoggedIn, toggleLoginModal, classes}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (cb=null) => {
    setAnchorEl(null);
    if (cb) cb();
  };

  return (
    <React.Fragment>
      {children}
      {children ? <Divider /> : null}
      {
        isLoggedIn ?
          <Button color="inherit">
            <Link to={"/library"} className={classes.link}>
              My Library
            </Link>
          </Button> : ''
      }
      {
        !isLoggedIn ? <Button color="inherit" onClick={toggleLoginModal}>Login</Button> : null
      }
      <IconButton
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={() => handleMenuClose()}
      >
        <a
          href="https://chrome.google.com/webstore/detail/arxivcolab/dijdhkcfdaocpepndegmbkgphbpomdai"
          target="_blank"
          className={classes.link}
        >
          <MenuItem onClick={() => handleMenuClose()}>
            Chrome Extension
          </MenuItem>
        </a>
        <a
          href="https://goo.gl/forms/fiEWkXfk4hLW6i1P2"
          target="_blank"
          className={classes.link}
        >
          <MenuItem onClick={() => handleMenuClose()}>
            Our poll
          </MenuItem>
        </a>
        <Link to={'/about'} className={classes.link}>
          <MenuItem color="inherit">
            About
          </MenuItem>
        </Link>
        <Divider />
        {
          isLoggedIn ?
            <MenuItem color="inherit" onClick={() => handleMenuClose(logout)}>Logout</MenuItem> :
            null
        }
      </Menu>
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
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
  }
};

const withRedux = connect(mapStateToProps, mapDispatchToProps);
const stylesWrapper = withStyles(styles);
export const DesktopMenu = withRedux(stylesWrapper(DesktopMenuRender));
export const MobileMenu = withRedux(stylesWrapper(MobileMenuRender));

