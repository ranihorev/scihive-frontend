import React from "react";
import PropTypes from "prop-types";
import MenuItem from "@material-ui/core/MenuItem/index";
import { withStyles } from "@material-ui/core/styles/index";
import Button from "@material-ui/core/Button";

const styles = () => ({
  unchangedText: {
    textTransform: "none",
    textDecoration: "none",
    color: "inherit",
    "&:focus": {
      outline: 'none',
    }
  },
  faIcon: {
    fontSize: '19px',
  }
});

const PaperMenuDekstopRender = ({classes}) => {
  return (
    <React.Fragment>
      <Button color="inherit">
        <a href="http://www.tricider.com/brainstorming/2urLxQ6t9XR" target="_blank" className={classes.unchangedText}>
          Suggest a Feature
        </a>
      </Button>
    </React.Fragment>
  )

};

PaperMenuDekstopRender.propTypes = {
  classes: PropTypes.object.isRequired
};

const PaperMenuMobileRender = ({classes, handleMobileMenuClick}) => {
  return (
    <React.Fragment>
      <a
        href="http://www.tricider.com/brainstorming/2urLxQ6t9XR"
        className={classes.unchangedText}
        target="_blank"
        onClick={() => handleMobileMenuClick()}
      >
        <MenuItem>
          Suggest a feature
        </MenuItem>
      </a>
    </React.Fragment>
  )

};

export const PaperDekstopMenu = withStyles(styles)(PaperMenuDekstopRender);

export const PaperMobileMenu = withStyles(styles)(PaperMenuMobileRender);
