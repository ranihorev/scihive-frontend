import {
  AppBar,
  Button,
  ButtonTypeMap,
  Divider,
  Drawer,
  ExtendButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Slide,
  Toolbar,
} from '@material-ui/core';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { Link as RouterLink } from 'react-router-dom';
import { useLogout } from '../auth/utils';
import { ReactComponent as Logo } from '../images/logoWhite.svg';
import { ReactComponent as LogoWithText } from '../images/logoWithText.svg';
import { useUserStore } from '../stores/user';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';

const HideOnScroll: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({ target: window });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const UserMenuContent: React.FC = () => {
  const onLogOut = useLogout('/start');
  const username = useUserStore(state => state.profile?.fullName);
  return (
    <React.Fragment>
      <MenuItem disabled>{username}</MenuItem>
      <MenuItem component={RouterLink} to="/library">
        Library
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={() => {
          onLogOut();
        }}
      >
        Log Out
      </MenuItem>
    </React.Fragment>
  );
};

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const loggedIn = useUserStore(state => state.status === 'loggedIn');
  if (!loggedIn) return null;
  return (
    <>
      <IconButton
        aria-label="show more"
        aria-haspopup="true"
        onClick={e => setAnchorEl(e.currentTarget)}
        color="inherit"
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <div>
          <UserMenuContent />
        </div>
      </Menu>
    </>
  );
};

export const TopBar: React.FC<{ rightMenu?: React.ReactElement; drawerContent?: React.ReactElement }> = ({
  rightMenu,
  drawerContent,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  return (
    <React.Fragment>
      <HideOnScroll>
        <AppBar position="sticky">
          <Toolbar variant="dense" className={styles.topBar} disableGutters={isMobile}>
            <div>
              {drawerContent && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => {
                    setIsDrawerOpen(state => !state);
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Spacer size={8} />
              <RouterLink to="/library">{isMobile ? <Logo height={26} /> : <LogoWithText height={26} />}</RouterLink>
            </div>
            <div>
              {rightMenu}
              <UserMenu />
            </div>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      >
        {drawerContent}
      </Drawer>
    </React.Fragment>
  );
};

type ButtonProps = ExtendButtonBase<ButtonTypeMap<{}, 'button'>>;

export const TopBarButton: React.FC<Omit<ButtonProps, 'component'> & { to: string }> = ({ to, ...props }) => {
  return <Button component={RouterLink} color="inherit" to={to} {...props} />;
};
