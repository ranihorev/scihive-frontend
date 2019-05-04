import React from "react";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";

const styles = theme => ({
  links: {
  },
  link: {
    textTransform: 'inherit',
    textDecoration: 'inherit',
    color: 'inherit',
  },
  popover: {
    maxHeight: '150px',
    overflowY: 'auto',
  },
});

const TwitterMeta = ({twtr_score, twtr_links, classes, iconClass}) => {
  const links = twtr_links ? twtr_links : [];
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <Button
        aria-owns={open ? 'simple-popper' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        disabled={links.length === 0}
      >
        <i className={`fab fa-twitter ${iconClass}`}></i> {twtr_score}
      </Button>
      <Popover
        id="simple-popper"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{paper: classes.popover}}
      >
        <List className={classes.links}>{
          links.map((l, idx) =>
            <a key={idx} className={classes.link} href={l.link} target={'_blank'}>
              <ListItem button >
                <ListItemIcon>
                  <i className="fab fa-twitter"></i>
                </ListItemIcon>
                {l.name}
              </ListItem>
            </a>
          )
        }</List>
      </Popover>
    </div>
  );

}

export default withStyles(styles)(TwitterMeta);
