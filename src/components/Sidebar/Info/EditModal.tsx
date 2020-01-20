/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fade, Modal } from '@material-ui/core';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { FileMetadata } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { MetadataEditor } from '../../uploader/MetadataEditor';

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
      date: state.date || new Date().toString(),
      abstract: state.summary || '',
    }),
    shallow,
  );
  const editPaper = usePaperStore(state => state.editPaper);
  const onSubmit = async (data: FileMetadata) => {
    try {
      await editPaper(data);
      closeModal();
    } catch (e) {
      toast.error('Failed to update paper :(', { autoClose: 3000 });
    }
  };

  return (
    <Modal open={isOpen}>
      <Fade in={isOpen}>
        <div css={[presets.modalCss, { width: 600 }]}>
          <MetadataEditor metadata={metadata} onClose={closeModal} onSubmit={onSubmit} />
        </div>
      </Fade>
    </Modal>
  );
};
