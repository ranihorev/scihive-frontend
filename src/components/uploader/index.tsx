/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { UploadButton } from './UploadFloatingButton';
import { UploadModal } from './UploadModal';

export const FileUploader: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <React.Fragment>
      <UploadButton openModal={() => setIsOpen(true)} />
      <UploadModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </React.Fragment>
  );
};
