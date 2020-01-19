/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import { presets } from '../../utils';

export const CollapseButton: React.FC<{ isCollapsed: boolean; onClick: () => void }> = ({ isCollapsed, onClick }) => {
  const Icon = isCollapsed ? MenuIcon : MenuOpenIcon;
  return (
    <div
      css={[
        presets.row,
        presets.centered,
        {
          padding: 2,
          marginLeft: 4,
          backgroundColor: isCollapsed ? '#e8e8e8' : undefined,
          borderRadius: 999,
        },
      ]}
    >
      <IconButton onClick={() => onClick()} size="small">
        <Icon
          css={css`
            width: 20px;
            height: 20px;
          `}
        />
      </IconButton>
    </div>
  );
};
