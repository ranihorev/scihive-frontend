/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fade, Modal } from '@material-ui/core';
import React from 'react';
import { presets } from '../../utils';
import { FileUpload } from './FileUpload';
import { FileMetadata } from './models';
import { MetadataEditor } from './MetadataEditor';

export const UploadModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = React.memo(
  ({ isOpen, closeModal }) => {
    const [fileMeta, setFileMeta] = React.useState<FileMetadata | undefined>();
    return (
      <Modal open={isOpen} onClose={closeModal}>
        <Fade in={isOpen}>
          <div css={presets.modalCss}>
            {!fileMeta ? <FileUpload setFileMeta={setFileMeta} /> : <div>Loaded</div>}
            <MetadataEditor />
          </div>
        </Fade>
      </Modal>
    );
  },
);
