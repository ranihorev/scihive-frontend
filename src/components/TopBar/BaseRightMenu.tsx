/** @jsx jsx */
import { css, jsx } from '@emotion/core';
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
import { createListener, MyCustomEvent, removeListener } from '../../utils';
import { simpleLink } from '../../utils/presets';
import { PopoverMenu } from '../PopoverMenu';

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
            <MenuItem onClick={handleMobileMenuClose}>My Library</MenuItem>
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
  isLoggedIn: boolean;
  toggleLoginModal: () => void;
}

const DesktopMenuRender: React.FC<DesktopMenuProps> = ({ children, isLoggedIn, toggleLoginModal }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [showLibraryBadge, setShowLibraryBadge] = React.useState(false);
  const handleMenuOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMenuClose = (cb: () => void = () => {}) => {
    setAnchorEl(null);
    cb();
  };

  React.useEffect(() => {
    let badgeTimeout: NodeJS.Timeout;
    const onUpdateLibrary = ({ detail }: MyCustomEvent<'updateLibrary'>) => {
      setShowLibraryBadge(detail.checked);
      if (badgeTimeout) clearTimeout(badgeTimeout);
      if (detail.checked) {
        badgeTimeout = setTimeout(() => setShowLibraryBadge(false), 300000);
      }
    };
    createListener('updateLibrary', onUpdateLibrary);
    return () => {
      if (badgeTimeout) clearTimeout(badgeTimeout);
      removeListener('updateLibrary', onUpdateLibrary);
    };
  }, []);

  return (
    <React.Fragment>
      {children}
      {children ? <Divider /> : null}
      {isLoggedIn ? (
        <React.Fragment>
          <Button color="inherit">
            <Badge
              color="secondary"
              badgeContent={showLibraryBadge ? '+1' : null}
              css={css`
                > .MuiBadge-badge {
                  right: -10px;
                  font-size: 11px;
                  top: 2px;
                }
              `}
            >
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
      <PopoverMenu
        anchorEl={anchorEl}
        placement="bottom-end"
        open={Boolean(anchorEl)}
        onClose={() => handleMenuClose()}
      >
        <div
          css={css`
            li {
              font-size: 14px;
              min-height: 40px;
            }
          `}
        >
          <Link to="/lists" css={simpleLink}>
            <MenuItem color="inherit">My Lists</MenuItem>
          </Link>
          <Divider />
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
        </div>
      </PopoverMenu>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
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
