/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';

export const UploadButton: React.FC<{ openModal: () => void }> = ({ openModal }) => {
  return (
    <div css={{ position: 'fixed', bottom: 15, right: 15 }}>
      <Fab color="primary" aria-label="add" size="small" onClick={openModal}>
        <AddIcon />
      </Fab>
    </div>
  );
};
