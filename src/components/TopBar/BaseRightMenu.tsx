/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Badge, Button, Divider, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import axios from 'axios/index';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { actions } from '../../actions';
import { RootState } from '../../models';
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

interface MobileMenuProps {
  rootChildren?: React.ReactElement;
  submenuChildren?: React.ReactElement;
  isLoggedIn: boolean;
  toggleLoginModal: () => void;
}

const MobileMenuRender: React.FC<MobileMenuProps> = ({
  rootChildren,
  submenuChildren,
  isLoggedIn,
  toggleLoginModal,
}) => {
  const [mobileAnchorEl, setMobileAnchorEl] = useState<HTMLElement | null>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent) => {
    setMobileAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileMenuClick = (cb: () => void = () => {}) => {
    handleMobileMenuClose();
    cb();
  };

  const submenuChildrenWithClose = submenuChildren
    ? React.Children.map(submenuChildren, child => React.cloneElement(child, { handleMobileMenuClick }))
    : null;

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
        {isLoggedIn && (
          <Link to="/library" css={simpleLink}>
            <MenuItem onClick={handleMobileMenuClose}>My library</MenuItem>
          </Link>
        )}

        {isLoggedIn && (
          <Link to="/groups" css={simpleLink}>
            <MenuItem>My lists</MenuItem>
          </Link>
        )}
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

let badgeTimeout: NodeJS.Timeout;

interface DesktopMenuProps {
  blinkLibrary: boolean;
  isLoggedIn: boolean;
  toggleLoginModal: () => void;
}

const DesktopMenuRender: React.FC<DesktopMenuProps> = ({ children, isLoggedIn, toggleLoginModal, blinkLibrary }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [showLibraryBadge, setShowLibraryBadge] = React.useState(false);
  const isInitialMount = React.useRef(true);
  const handleMenuOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMenuClose = (cb: () => void = () => {}) => {
    setAnchorEl(null);
    cb();
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
        <React.Fragment>
          <Button color="inherit">
            <Link to="/lists" css={simpleLink}>
              My lists
            </Link>
          </Button>
          <Button color="inherit">
            <Badge color="secondary" badgeContent={showLibraryBadge ? '+1' : null}>
              <Link to="/library" css={simpleLink}>
                My Library
              </Link>
            </Badge>
          </Button>
        </React.Fragment>
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
        css={css`
          li {
            font-size: 14px;
            min-height: 40px;
          }
        `}
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
        <a
          href="http://www.tricider.com/brainstorming/2urLxQ6t9XR"
          target="_blank"
          rel="noopener noreferrer"
          css={simpleLink}
        >
          <MenuItem onClick={() => handleMenuClose()}>Suggest a feature</MenuItem>
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

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    blinkLibrary: state.user.blinkLibraryState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
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
