/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, IconButtonProps } from '@material-ui/core';
import copy from 'clipboard-copy';
import React from 'react';
import { toast } from 'react-toastify';

interface Props extends IconButtonProps {
  iconSize: number;
  buttonSize?: IconButtonProps['size'];
  groupId: string;
}

const GroupShare: React.FC<Props> = ({ iconSize, buttonSize, groupId, ...props }) => {
  const handleGroupShare = () => {
    copy(`${window.location.origin}/collection/${groupId}/`);
    toast.info(`Link was copied to clipboard`, { autoClose: 2000 });
  };

  return (
    <IconButton aria-label="Share" onClick={() => handleGroupShare()} size={buttonSize} {...props}>
      <i
        className="fas fa-share-alt"
        css={{ fontSize: iconSize, marginLeft: -1, padding: buttonSize === 'small' ? 5 : undefined }}
      />
    </IconButton>
  );
};

export default GroupShare;
