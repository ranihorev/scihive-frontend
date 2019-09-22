/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { IconButton } from '@material-ui/core';
import { presets } from '../utils';

interface Props {
  onClick: (e: React.MouseEvent) => void;
  icon: string;
  size: number;
  iconSize: number;
}

export const ButtonIcon: React.FC<Props> = ({ onClick, icon, size, iconSize }) => (
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
