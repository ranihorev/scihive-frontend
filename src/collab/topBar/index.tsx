import { AppBar, Drawer, IconButton, Menu, MenuItem, Slide, Toolbar, Divider } from '@material-ui/core';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import { useLogout } from '../../auth/utils';
import { ReactComponent as Logo } from '../../images/logoWhite.svg';
import { ReactComponent as LogoWithText } from '../../images/logoWithText.svg';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';
import { useUserNewStore } from '../../stores/userNew';

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

const MoreMenuContent: React.FC = () => {
  const onLogOut = useLogout('/collab/start');
  const username = useUserNewStore(state => state.profile?.name);
  return (
    <React.Fragment>
      <MenuItem disabled>{username}</MenuItem>
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

const MoreMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const loggedIn = useUserNewStore(state => state.status === 'loggedIn');
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
        <MoreMenuContent />
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
              <Link to="/collab/start">{isMobile ? <Logo height={26} /> : <LogoWithText height={26} />}</Link>
            </div>
            <div>
              {rightMenu}
              <MoreMenu />
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
