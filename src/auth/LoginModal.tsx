/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal, Typography } from '@material-ui/core';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import shallow from 'zustand/shallow';
import baseStyles from '../base.module.scss';
import { useUserStore } from '../stores/user';
import { LoginForm } from './LoginForm';
import { Spacer } from '../utils/Spacer';
import cx from 'classnames';
import styles from './styles.module.scss';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, toggleLoginModal, message } = useUserStore(
    state => ({
      isLoginModalOpen: state.loginModal.isOpen,
      toggleLoginModal: () => state.toggleLoginModal(),
      message: state.loginModal.message,
    }),
    shallow,
  );
  return (
    <React.Fragment>
      <Modal open={isLoginModalOpen} onClose={toggleLoginModal}>
        <div className={cx(baseStyles.modal, styles.modalRoot, 'rounded')}>
          <Typography variant="h4">Log In</Typography>
          {message && (
            <Typography variant="body2" className="mt-4 text-center">
              {message}
            </Typography>
          )}
          <Spacer size={32} />
          <LoginForm
            enableRedirect={false}
            onSuccess={() => {
              toggleLoginModal();
            }}
          />
        </div>
      </Modal>
    </React.Fragment>
  );
};
