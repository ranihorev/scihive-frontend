/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton } from '@material-ui/core';
import React from 'react';
import { COLORS } from '../../utils/presets';

export const actionIconCss = css({ fontSize: 12, color: COLORS.grey });

export const ActionIconButton: React.FC<{ onClick: (e: React.MouseEvent) => void; name: string }> = ({
  onClick,
  name,
}) => (
  <IconButton onClick={onClick}>
    <i className={name} css={actionIconCss} />
  </IconButton>
);
