/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/core';
import { Button, List, ListItem, ListItemIcon, Popover } from '@material-ui/core';
import React from 'react';
import { TwitterLink } from '../models';
import { sortBy } from 'lodash';

interface Props {
  twtr_score: number;
  twtr_links: TwitterLink[];
  iconCss: SerializedStyles;
}

const TwitterMeta: React.FC<Props> = ({ twtr_score, twtr_links, iconCss }) => {
  let links = twtr_links || [];
  links = sortBy(links, 'score');

  const [anchorEl, setAnchorEl] = React.useState<Element>();

  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
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
        css={css`
          > .MuiPopover-paper {
            max-height: 150px;
            overflow-y: auto;
          }
        `}
      >
        <List>
          {links.map((l, idx) => (
            <a
              key={idx}
              css={css`
                text-transform: inherit;
                text-decoration: inherit;
                color: inherit;
                font-size: 13px;
              `}
              href={l.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItem button>
                <ListItemIcon
                  css={css`
                    margin-right: 8px;
                    min-width: 0;
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

export default TwitterMeta;
