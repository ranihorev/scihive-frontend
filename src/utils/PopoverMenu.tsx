/** @jsx jsx */
import { jsx } from '@emotion/core';
import { SerializedStyles } from '@emotion/css';
import { ClickAwayListener, Paper, Popper, ClickAwayListenerProps } from '@material-ui/core';
import { PopperProps } from '@material-ui/core/Popper';
import React from 'react';

interface PopoverMenuProps {
  anchorEl: PopperProps['anchorEl'];
  open: boolean;
  placement: PopperProps['placement'];
  onClose: ClickAwayListenerProps['onClickAway'];
  contentCss?: SerializedStyles;
  className?: string;
  zIndex?: number;
  mouseEvent?: ClickAwayListenerProps['mouseEvent'];
}

export const PopoverMenu: React.FC<PopoverMenuProps> = ({
  anchorEl,
  children,
  open,
  placement,
  onClose,
  contentCss,
  zIndex = 1,
  className,
  mouseEvent,
}) => {
  return (
    <Popper anchorEl={anchorEl} placement={placement} open={open} style={{ zIndex }}>
      <ClickAwayListener onClickAway={onClose} mouseEvent={mouseEvent}>
        <Paper css={contentCss} className={className} elevation={2}>
          {children}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};
