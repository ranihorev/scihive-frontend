import React from 'react';
import { Popper, ClickAwayListener, Paper } from '@material-ui/core';
import { PopperProps } from '@material-ui/core/Popper';

interface PopoverMenuProps {
  anchorEl: PopperProps['anchorEl'];
  open: boolean;
  placement: PopperProps['placement'];
  onClose: () => void;
}

export const PopoverMenu: React.FC<PopoverMenuProps> = ({ anchorEl, children, open, placement, onClose }) => {
  return (
    <Popper anchorEl={anchorEl} placement={placement} open={open} style={{ zIndex: 1 }}>
      <ClickAwayListener onClickAway={onClose}>
        <Paper>{children}</Paper>
      </ClickAwayListener>
    </Popper>
  );
};
