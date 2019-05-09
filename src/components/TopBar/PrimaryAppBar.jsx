import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar/index";
import Toolbar from "@material-ui/core/Toolbar/index";
import { withStyles } from "@material-ui/core/styles/index";
import {Link} from "react-router-dom";
import SearchBar from "./SearchBar";
import {MobileMenu, DesktopMenu} from "./BaseRightMenu";
import Headroom from "react-headroom";

const styles = theme => ({
  root: {
    width: "100%"
  },
  gutters: {
    [theme.breakpoints.down("sm")]: {
      paddingRight: "4px",
    }
  },
  grow: {
    flexGrow: 1
  },
  home: {
    textTransform: 'none',
    textDecoration: 'none',
    color: 'inherit',
    margin: 'auto 0',
  },
  link: {
    textTransform: 'inherit',
    textDecoration: 'inherit',
    color: 'inherit',
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  leftMenu: {
    display: "flex",
    flexGrow: 1,
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex"
    }
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  }
});

const PrimaryAppBar = ({ classes, desktopItems, mobileRootItems, mobileSubItems }) => {
  return (
    <Headroom>
      <AppBar position='relative' style={{backgroundColor: '#36a0f5'}}>
        <Toolbar classes={{gutters: classes.gutters}} variant="dense">
          <div className={classes.leftMenu}>
            <Link to={'/'} className={classes.home}>
                SciHive
            </Link>
            <SearchBar/>
          </div>
          <div className={classes.sectionDesktop}>
            <DesktopMenu>
              {desktopItems}
            </DesktopMenu>
          </div>
          <div className={classes.sectionMobile}>
            <MobileMenu rootChildren={mobileRootItems} submenuChildren={mobileSubItems}/>
          </div>
        </Toolbar>
      </AppBar>
    </Headroom>
  );

}

PrimaryAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

const stylesWrapper = withStyles(styles);
export default stylesWrapper(PrimaryAppBar);

export const APP_BAR_HEIGHT = 48;
