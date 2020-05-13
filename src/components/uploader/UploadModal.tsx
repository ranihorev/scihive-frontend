/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fade, Modal, Typography } from '@material-ui/core';
import React from 'react';
import { presets } from '../../utils';
import { FileUpload } from './FileUpload';
import { Warning } from './Warning';

export const UploadModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = React.memo(
  ({ isOpen, closeModal }) => {
    return (
      <Modal
        open={isOpen}
        onClose={() => {
          closeModal();
        }}
      >
        <Fade in={isOpen}>
          <div css={[presets.modalCss, { width: 600 }]}>
            <Typography variant="h6">Upload a Paper</Typography>
            <Warning />
            <FileUpload />
          </div>
        </Fade>
      </Modal>
    );
  },
);
