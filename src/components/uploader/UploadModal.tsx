/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fade, Modal, Typography } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router';
import { FileMetadata } from '../../models';
import { uploadPaperDetails } from '../../thunks';
import { presets } from '../../utils';
import { FileUpload } from './FileUpload';
import { MetadataEditor } from './MetadataEditor';
import { Warning } from './Warning';

export const UploadModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = React.memo(
  ({ isOpen, closeModal }) => {
    const history = useHistory();
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
