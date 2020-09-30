/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal } from '@material-ui/core';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import shallow from 'zustand/shallow';
import baseStyles from '../base.module.scss';
import { useUserStore } from '../stores/user';
import { PasswordLoginForm } from './PasswordLogin';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, toggleLoginModal } = useUserStore(
    state => ({
      isLoginModalOpen: state.loginModal.isOpen,
      toggleLoginModal: () => state.toggleLoginModal(),
    }),
    shallow,
  );
  return (
    <React.Fragment>
      <Modal open={isLoginModalOpen} onClose={toggleLoginModal}>
        <div className={baseStyles.modal}>
          <PasswordLoginForm />
        </div>
      </Modal>
    </React.Fragment>
  );
};
