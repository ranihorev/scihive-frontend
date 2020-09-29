/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, FormControl, Input, InputLabel, Modal } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { User } from '../../models';
import { useUserStore } from '../../stores/user';
import { useUserNewStore } from '../../stores/userNew';
import { track } from '../../Tracker';

const formControl = css`
  margin-top: 20px;
`;

const LoginSignupForm: React.FC = () => {
  const { onSubmitSuccess, loginModalMessage } = useUserStore(
    state => ({
      onSubmitSuccess: (user: User) => {
        state.setUser(user);
        state.toggleLoginModal();
      },
      loginModalMessage: state.loginModalMessage,
    }),
    shallow,
  );
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name;
    setUserData({ ...userData, [field]: e.target.value });
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    const endpoint = `/user/login`;
    axios
      .post(endpoint, userData)
      .then(res => {
        localStorage.setItem('username', res.data.username);
        track('Login');
        // Redundant: keep it here in case we won't reload the page one day
        onSubmitSuccess(res.data);
        toast.success('You are now logged in!');
      })
      .catch(err => {
        let msg = 'Failed to reach server';
        try {
          msg = err.response.data.message;
        } catch (exc) {
          // Do nothing
        }
        setErrMsg(msg);
      });
  };

  return (
    <form onSubmit={submitForm} className="loginSignupForm">
      <div
        css={css`
          font-size: 20px;
          text-align: center;
          font-weight: bold;
        `}
      >
        {loginModalMessage || 'Log in'}
      </div>
      <FormControl css={formControl} fullWidth>
        <InputLabel>Email</InputLabel>
        <Input type="email" name="email" value={userData.email} onChange={handleChange} required />
      </FormControl>
      <FormControl css={formControl} fullWidth>
        <InputLabel>Password</InputLabel>
        <Input name="password" value={userData.password} onChange={handleChange} type="password" required />
      </FormControl>
      <div
        css={css`
          margin-top: 20px;
          text-align: center;
        `}
      >
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </div>
      <div
        css={css`
          text-align: center;
          margin-top: 10px;
          font-size: 12px;
          color: red;
        `}
      >
        {errMsg}
      </div>
    </form>
  );
};

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, toggleLoginModal } = useUserNewStore(
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
          <LoginSignupForm />
        </div>
      </Modal>
    </React.Fragment>
  );
};
