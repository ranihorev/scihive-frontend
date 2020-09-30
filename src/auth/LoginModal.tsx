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
        <div className={cx(baseStyles.modal, styles.modalRoot)}>
          <Typography variant="h3">Log In</Typography>
          <Spacer size={32} />
          <LoginForm />
        </div>
      </Modal>
    </React.Fragment>
  );
};
