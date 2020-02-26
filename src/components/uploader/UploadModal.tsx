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
    const [fileMeta, setFileMeta] = React.useState<FileMetadata | undefined>();
    React.useEffect(() => {
      if (isOpen) {
        setFileMeta(undefined);
      }
    }, [isOpen]);
    const history = useHistory();
    const onSubmit = React.useCallback(
      (metadata: FileMetadata) => {
        uploadPaperDetails(metadata, history);
      },
      [history],
    );
    return (
      <Modal
        open={isOpen}
        onClose={() => {
          !fileMeta && closeModal();
        }}
      >
        <Fade in={isOpen}>
          <div css={[presets.modalCss, { width: 600 }]}>
            <Typography variant="h6">Upload a Paper</Typography>
            <Warning />
            {!fileMeta ? (
              <FileUpload setFileMeta={setFileMeta} />
            ) : (
              <MetadataEditor metadata={fileMeta} onClose={closeModal} onSubmit={onSubmit} />
            )}
          </div>
        </Fade>
      </Modal>
    );
  },
);
