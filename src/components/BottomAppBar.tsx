/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { AppBar, CssBaseline, Toolbar } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import React from 'react';
import { presets } from '../utils';

const BottomAppBar: React.FC = () => {
  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="primary"
        css={css`
          top: auto;
          bottom: 0;
        `}
      >
        <Toolbar
          css={css`
            ${presets.centered}
          `}
        >
          <a
            href="https://goo.gl/forms/fiEWkXfk4hLW6i1P2"
            target="_blank"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            Take our poll
            <ChatIcon />
          </a>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default BottomAppBar;
