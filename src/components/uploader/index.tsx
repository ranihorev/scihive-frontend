/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { track } from '../../Tracker';
import { UploadButton } from './UploadFloatingButton';
import { UploadModal } from './UploadModal';
import { useUserStore } from '../../stores/user';

export const FileUploader: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const { isLoggedIn, toggleLoginModal } = useUserStore(state => ({
    isLoggedIn: Boolean(state.userData),
    toggleLoginModal: state.toggleLoginModal,
  }));

  return (
    <React.Fragment>
      <UploadButton
        openModal={() => {
          track('startPaperUpload', { isLoggedIn });
          if (isLoggedIn) {
            setIsOpen(true);
          } else {
            toggleLoginModal('Please log in to upload a new paper');
          }
        }}
      />
      <UploadModal isOpen={isOpen} closeModal={closeModal} />
    </React.Fragment>
  );
});
