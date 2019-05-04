import React, { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { withStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import MoreIcon from "@material-ui/icons/MoreVert";
import Button from "@material-ui/core/Button";
import LoginSignupModal from "./LoginSignupModal";
import axios from "axios";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";

const styles = theme => ({
  root: {
    width: "100%"
  },
  grow: {
    flexGrow: 1
  },
  home: {
    textTransform: "none",
    textDecoration: "none",
    color: "inherit"
  },
  label: {
    textTransform: "capitalize"
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit * 3,
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 6,
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 6,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "300px"
    }
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex"
    }
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  }
});

function PrimarySearchAppBar(props) {
  const { classes } = props;
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("username"))
  );

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const keyPress = e => {
    if (e.keyCode === 13) {
      console.log("Redirecting to ", e.target.value);
      props.history.push("/search/" + e.target.value);
    }
  };

  const logout = () => {
    axios
      .post("/user/logout/access")
      .then(res => {
        localStorage.removeItem("username");
        setLoggedIn(false);
      })
      .catch(err => console.log(err.response));
  };

  const closeModal = loginSuccess => {
    if (loginSuccess) setLoggedIn(true);
    setOpenLoginModal(false);
  };

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      open={Boolean(mobileMoreAnchorEl)}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleMobileMenuClose}>
        <p>My Library</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.root}>
      <LoginSignupModal open={openLoginModal} closeModal={closeModal} />
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            className={classes.title}
            variant="h6"
            color="inherit"
            noWrap
          />
          <Link to={"/"} className={classes.home}>
            <Typography
              className={classes.title}
              variant="h6"
              color="inherit"
              noWrap
            >
              KnowPro
            </Typography>
          </Link>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              fullWidth
              placeholder="Search…"
              onKeyDown={keyPress}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {isLoggedIn ? (
              <Button color="inherit">
                <Link to={"/library"} className={classes.home}>
                  My library
                </Link>
              </Button>
            ) : (
              ""
            )}
            {isLoggedIn ? (
              <Button
                color="inherit"
                onClick={logout}
                classes={{ label: classes.label }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={() => setOpenLoginModal(!openLoginModal)}
              >
                Login
              </Button>
            )}
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}

PrimarySearchAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(PrimarySearchAppBar));
