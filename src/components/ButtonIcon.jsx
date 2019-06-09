/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { IconButton } from '@material-ui/core';
import { presets } from '../utils';

export const ButtonIcon = ({ onClick, icon, size, iconSize }) => (
  <IconButton color="inherit" onClick={onClick}>
    <div
      css={css`
        ${presets.centered};
        display: flex;
        width: ${size}px;
        height: ${size}px;
      `}
    >
      <i
        className={icon}
        css={css`
          font-size: ${iconSize}px;
        `}
      />
    </div>
  </IconButton>
);
