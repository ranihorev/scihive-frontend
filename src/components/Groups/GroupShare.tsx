/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, IconButtonProps } from '@material-ui/core';
import copy from 'clipboard-copy';
import React from 'react';
import { toast } from 'react-toastify';

const GroupShare: React.FC<{ iconSize: number; buttonSize?: IconButtonProps['size']; groupId: string }> = ({
  iconSize,
  buttonSize,
  groupId,
}) => {
  const handleGroupShare = () => {
    copy(`${window.location.origin}/collection/${groupId}/`);
    toast.info(`Link was copied to clipboard`, { autoClose: 2000 });
  };

  return (
    <IconButton aria-label="Share" onClick={() => handleGroupShare()} size={buttonSize}>
      <i
        className="fas fa-share-alt"
        css={{ fontSize: iconSize, marginLeft: -1, padding: buttonSize === 'small' ? 5 : undefined }}
      />
    </IconButton>
  );
};

export default GroupShare;
