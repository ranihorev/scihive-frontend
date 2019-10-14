import React from 'react';
import AppBar from '@material-ui/core/AppBar/index';
import Toolbar from '@material-ui/core/Toolbar/index';
import { withStyles, Theme } from '@material-ui/core/styles/index';
import { Link } from 'react-router-dom';
import Headroom from 'react-headroom';
import SearchBar from './SearchBar';
import { MobileMenu, DesktopMenu } from './BaseRightMenu';

const styles = (theme: Theme) => ({
  root: {
    width: '100%',
  },
  gutters: {
    [theme.breakpoints.down('sm')]: {
      paddingRight: '4px',
    },
  },
  grow: {
    flexGrow: 1,
  },
  home: {
    // textTransform: 'none',
    textDecoration: 'none',
    color: 'inherit',
    margin: 'auto 0',
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  leftMenu: {
    display: 'flex',
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'center',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

interface Props {
  classes: { [key: string]: string };
  desktopItems?: React.ReactElement;
  mobileRootItems?: React.ReactElement;
  mobileSubItems?: React.ReactElement;
}

const PrimaryAppBar: React.FC<Props> = ({ classes, desktopItems, mobileRootItems, mobileSubItems }) => {
  return (
    <Headroom>
      <AppBar position="relative" style={{ backgroundColor: '#36a0f5', color: '#ffffff' }}>
        <Toolbar classes={{ gutters: classes.gutters }} variant="dense">
          <div className={classes.leftMenu}>
            <Link to="/" className={classes.home}>
              SciHive
            </Link>
            <SearchBar />
          </div>
          <div className={classes.sectionDesktop}>
            <DesktopMenu>{desktopItems}</DesktopMenu>
          </div>
          <div className={classes.sectionMobile}>
            <MobileMenu rootChildren={mobileRootItems} submenuChildren={mobileSubItems} />
          </div>
        </Toolbar>
      </AppBar>
    </Headroom>
  );
};

const stylesWrapper = withStyles(styles);
export default stylesWrapper(PrimaryAppBar);

export const APP_BAR_HEIGHT = 48;
