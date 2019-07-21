/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { withStyles, List, ListItem, ListItemIcon, Button, Popover } from '@material-ui/core';

const styles = () => ({
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

const CodeMeta = ({ data, classes, iconClass }) => {
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
        size="small"
        css={css`
          padding: 0 4px;
        `}
      >
        <i className={`fas fa-code ${iconClass}`} /> {data.stars || 0}
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
        <List>
          <a
            className={classes.link}
            href={data.github}
            target="_blank"
            rel="noopener noreferrer"
            css={css`
              font-size: 13px;
            `}
          >
            <ListItem>
              <ListItemIcon
                css={css`
                  margin-right: 8px;
                `}
              >
                <i className="fab fa-github" />
              </ListItemIcon>
              Github
            </ListItem>
          </a>
          <a
            className={classes.link}
            href={data.paperswithcode}
            target="_blank"
            rel="noopener noreferrer"
            css={css`
              font-size: 13px;
            `}
          >
            <ListItem>
              <ListItemIcon
                css={css`
                  margin-right: 8px;
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="#21cbce"
                  css={css`
                    height: 15px;
                    width: 15px;
                  `}
                >
                  <path d="M88 128h48v256H88zM232 128h48v256h-48zM160 144h48v224h-48zM304 144h48v224h-48zM376 128h48v256h-48z" />
                  <path d="M104 104V56H16v400h88v-48H64V104zM408 56v48h40v304h-40v48h88V56z" />
                </svg>
              </ListItemIcon>
              PapersWithCode
            </ListItem>
          </a>
        </List>
      </Popover>
    </div>
  );
};

export default withStyles(styles)(CodeMeta);
