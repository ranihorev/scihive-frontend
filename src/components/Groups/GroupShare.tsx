/** @jsx jsx */
import React from 'react';
import copy from 'clipboard-copy';
import { toast } from 'react-toastify';
import { css, jsx } from '@emotion/core';
import { IconButton } from '@material-ui/core';

const GroupShare: React.FC<{ size: number; groupId: string }> = ({ size, groupId }) => {
  const handleGroupShare = () => {
    copy(`${window.location.origin}/list/${groupId}/`);
    toast.info(`Link was copied to clipboard`, { autoClose: 2000 });
  };

  return (
    <IconButton aria-label="Share" onClick={() => handleGroupShare()}>
      <i className="fas fa-share-alt" css={css({ fontSize: size })} />
    </IconButton>
  );
};

export default GroupShare;
