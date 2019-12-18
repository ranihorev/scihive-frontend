/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import queryString from 'query-string';
import { UploadButton } from './UploadFloatingButton';
import { UploadModal } from './UploadModal';
import { useLocation } from 'react-router';

export const FileUploader: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const location = useLocation();
  const params = queryString.parse(location.search);
  if (!params.staging) {
    return null;
  }
  return (
    <React.Fragment>
      <UploadButton openModal={() => setIsOpen(true)} />
      <UploadModal isOpen={isOpen} closeModal={closeModal} />
    </React.Fragment>
  );
});
