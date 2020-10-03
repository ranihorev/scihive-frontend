/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Badge, Button, Divider, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import axios from 'axios/index';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { useUserStore } from '../../stores/user';
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
  submenuChildren?: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ rootChildren, submenuChildren }) => {
  const { isLoggedIn, toggleLoginModal } = useUserStore(
    state => ({ isLoggedIn: Boolean(state.userData), toggleLoginModal: state.toggleLoginModal }),
    shallow,
  );
  const [mobileAnchorEl, setMobileAnchorEl] = useState<HTMLElement | null>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent) => {
    setMobileAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  return (
    <React.Fragment>
      {rootChildren}
      <IconButton aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit" size="small">
        <MoreIcon style={{ padding: 5 }} />
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
        css={{
          li: {
            minHeight: 40,
          },
        }}
        open={Boolean(mobileAnchorEl)}
        onClose={handleMobileMenuClose}
        onClick={() => handleMobileMenuClose()}
      >
        {submenuChildren}
        {isLoggedIn && (
          <Link to="/library" css={simpleLink}>
            <MenuItem>My Library</MenuItem>
          </Link>
        )}
        <a
          href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai"
          target="_blank"
          rel="noopener noreferrer"
          css={simpleLink}
        >
          <MenuItem>Chrome Extension</MenuItem>
        </a>
        <a href="https://start.scihive.org" css={simpleLink}>
          <MenuItem color="inherit">About</MenuItem>
        </a>
        <Link to="/privacy-policy" css={simpleLink}>
          <MenuItem>Privacy Policy</MenuItem>
        </Link>
        <Link to="/terms-of-service" css={simpleLink}>
          <MenuItem>Terms of Service</MenuItem>
        </Link>
        <Divider />
        {isLoggedIn ? (
          <MenuItem color="inherit" onClick={() => logout()}>
            Logout
          </MenuItem>
        ) : (
          <MenuItem color="inherit" onClick={() => toggleLoginModal()}>
            Login
          </MenuItem>
        )}
      </Menu>
    </React.Fragment>
  );
};

export const DesktopMenu: React.FC = ({ children }) => {
  const { isLoggedIn, toggleLoginModal } = useUserStore(
    state => ({ isLoggedIn: Boolean(state.userData), toggleLoginModal: state.toggleLoginModal }),
    shallow,
  );
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
        badgeTimeout = setTimeout(() => setShowLibraryBadge(false), 50000);
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
                  line-height: 0;
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
        <Button onClick={() => toggleLoginModal()} css={simpleLink}>
          Login
        </Button>
      ) : null}
      <IconButton aria-haspopup="true" onClick={handleMenuOpen} color="inherit" size="small">
        <MoreIcon fontSize="small" css={{ padding: 5 }} />
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
          <a
            href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai"
            target="_blank"
            rel="noopener noreferrer"
            css={simpleLink}
          >
            <MenuItem onClick={() => handleMenuClose()}>Chrome Extension</MenuItem>
          </a>
          <a href="https://start.scihive.org" css={simpleLink}>
            <MenuItem color="inherit">About</MenuItem>
          </a>
          <Link to="/privacy-policy" css={simpleLink}>
            <MenuItem>Privacy Policy</MenuItem>
          </Link>
          <Link to="/terms-of-service" css={simpleLink}>
            <MenuItem>Terms of Service</MenuItem>
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
