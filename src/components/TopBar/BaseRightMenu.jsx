/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { Badge, IconButton, MenuItem, Menu, Divider, Button } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import axios from 'axios/index';
import { connect } from 'react-redux';
import { actions } from '../../actions';
import { simpleLink } from '../../utils/presets';

const logout = () => {
  axios
    .post('/user/logout/access')
    .then(() => {
      localStorage.removeItem('username');
      window.location.href = '/';
    })
    .catch(err => console.log(err.response));
};

const MobileMenuRender = ({ rootChildren = null, submenuChildren = null, isLoggedIn, toggleLoginModal }) => {
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const handleMobileMenuOpen = event => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileMenuClick = (cb = null) => {
    handleMobileMenuClose();
    if (cb) cb();
  };

  const submenuChildrenWithClose = React.Children.map(submenuChildren, child =>
    React.cloneElement(child, { handleMobileMenuClick }),
  );

  return (
    <React.Fragment>
      {rootChildren}
      <IconButton aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
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
        {isLoggedIn ? (
          <Link to="/library" css={simpleLink}>
            <MenuItem onClick={handleMobileMenuClose}>My library</MenuItem>
          </Link>
        ) : null}
        <Divider />
        <a
          href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai"
          target="_blank"
          rel="noopener noreferrer"
          css={simpleLink}
        >
          <MenuItem onClick={handleMobileMenuClose}>Chrome Extension</MenuItem>
        </a>
        <Link to="/about" css={simpleLink}>
          <MenuItem color="inherit">About</MenuItem>
        </Link>
        <Divider />
        {isLoggedIn ? (
          <MenuItem color="inherit" onClick={() => handleMobileMenuClick(logout)}>
            Logout
          </MenuItem>
        ) : (
          <MenuItem color="inherit" onClick={() => handleMobileMenuClick(toggleLoginModal)}>
            Login
          </MenuItem>
        )}
      </Menu>
    </React.Fragment>
  );
};

let badgeTimeout;

const DesktopMenuRender = ({ children, isLoggedIn, toggleLoginModal, blinkLibrary }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showLibraryBadge, setShowLibraryBadge] = React.useState(false);
  const isInitialMount = React.useRef(true);
  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (cb = null) => {
    setAnchorEl(null);
    if (cb) cb();
  };

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return () => {};
    }
    setShowLibraryBadge(true);
    badgeTimeout = setTimeout(() => setShowLibraryBadge(false), 3000);
    return () => {
      if (badgeTimeout) clearTimeout(badgeTimeout);
    };
  }, [blinkLibrary]);

  return (
    <React.Fragment>
      {children}
      {children ? <Divider /> : null}
      {isLoggedIn ? (
        <Button color="inherit">
          <Badge color="secondary" badgeContent={showLibraryBadge ? '+1' : null}>
            <Link to="/library" css={simpleLink}>
              My Library
            </Link>
          </Badge>
        </Button>
      ) : (
        ''
      )}
      {!isLoggedIn ? (
        <Button onClick={toggleLoginModal} css={simpleLink}>
          Login
        </Button>
      ) : null}
      <IconButton aria-haspopup="true" onClick={handleMenuOpen} color="inherit">
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
          href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai"
          target="_blank"
          rel="noopener noreferrer"
          css={simpleLink}
        >
          <MenuItem onClick={() => handleMenuClose()}>Chrome Extension</MenuItem>
        </a>
        <a href="https://goo.gl/forms/fiEWkXfk4hLW6i1P2" target="_blank" rel="noopener noreferrer" css={simpleLink}>
          <MenuItem onClick={() => handleMenuClose()}>Our poll</MenuItem>
        </a>
        <Link to="/about" css={simpleLink}>
          <MenuItem color="inherit">About</MenuItem>
        </Link>
        {isLoggedIn ? (
          <div>
            <Divider />
            <MenuItem color="inherit" onClick={() => handleMenuClose(logout)}>
              Logout
            </MenuItem>
          </div>
        ) : null}
      </Menu>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    blinkLibrary: state.user.blinkLibraryState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export const DesktopMenu = withRedux(DesktopMenuRender);
export const MobileMenu = withRedux(MobileMenuRender);
