/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fade, Modal } from '@material-ui/core';
import React from 'react';
import { presets } from '../../../utils';
import { MetadataEditor } from '../../uploader/MetadataEditor';
import { FileMetadata } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import shallow from 'zustand/shallow';

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

export const EditModal: React.FC<Props> = ({ isOpen, closeModal }) => {
  const metadata: FileMetadata = usePaperStore(
    state => ({
      title: state.title || '',
      md5: '',
      authors: state.authors,
      date: state.date || null,
      abstract: state.summary || '',
    }),
    shallow,
  );
  return (
    <Modal open={isOpen}>
      <Fade in={isOpen}>
        <div css={[presets.modalCss, { width: 600 }]}>
          <MetadataEditor metadata={metadata} onClose={closeModal} onSubmit={data => console.log(data)} />
        </div>
      </Fade>
    </Modal>
  );
};
