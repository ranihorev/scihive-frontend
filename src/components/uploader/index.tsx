/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { UploadButton } from './UploadFloatingButton';
import { UploadModal } from './UploadModal';

export const FileUploader: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <React.Fragment>
      <UploadButton openModal={() => setIsOpen(true)} />
      <UploadModal isOpen={isOpen} closeModal={closeModal} />
    </React.Fragment>
  );
});
