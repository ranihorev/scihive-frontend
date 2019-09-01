/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { withStyles, List, ListItem, ListItemIcon, Button, Popover } from '@material-ui/core';

const styles = () => ({
  links: {},
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

const TwitterMeta = ({ twtr_score, twtr_links, classes, iconCss }) => {
  const links = twtr_links || [];
  links.sort((a, b) => b.score - a.score);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
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
        size="small"
        css={css`
          padding: 0 4px;
        `}
      >
        <i className="fab fa-twitter" css={iconCss} /> {twtr_score}
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
        classes={{ paper: classes.popover }}
      >
        <List className={classes.links}>
          {links.map((l, idx) => (
            <a
              key={idx}
              className={classes.link}
              href={l.link}
              target="_blank"
              rel="noopener noreferrer"
              css={css`
                font-size: 13px;
              `}
            >
              <ListItem button>
                <ListItemIcon
                  css={css`
                    margin-right: 8px;
                  `}
                >
                  <i className="fab fa-twitter" />
                </ListItemIcon>
                <span>{l.name}</span>
                <span
                  css={css`
                    padding-left: 5px;
                    font-size: 12px;
                    color: #bfbfbf;
                  `}
                >
                  ({l.score})
                </span>
              </ListItem>
            </a>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export default withStyles(styles)(TwitterMeta);
