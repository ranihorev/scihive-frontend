/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, FormControl, Input, InputLabel, Modal } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import shallow from 'zustand/shallow';
import { User } from '../../models';
import { useUserStore } from '../../stores/user';
import { track } from '../../Tracker';
import * as presets from '../../utils/presets';

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
  const [isLogin, setIsLogin] = useState(true);
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
    const endpoint = `/user/${isLogin ? 'login' : 'register'}`;
    axios
      .post(endpoint, userData)
      .then(res => {
        localStorage.setItem('username', res.data.username);
        track(isLogin ? 'Login' : 'Register');
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

  const switchForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogin(!isLogin);
  };

  const title = isLogin ? 'Log in' : 'Sign up';
  return (
    <form onSubmit={submitForm} className="loginSignupForm">
      <div
        css={css`
          font-size: 20px;
          text-align: center;
          font-weight: bold;
        `}
      >
        {loginModalMessage || title}
      </div>
      {!isLogin ? (
        <FormControl css={formControl} fullWidth>
          <InputLabel>User Name (Optional)</InputLabel>
          <Input name="username" value={userData.username} onChange={handleChange} required />
        </FormControl>
      ) : null}
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
      <div
        css={css`
          margin-top: 20px;
          text-align: center;
        `}
      >
        {isLogin ? 'Not a member yet?' : 'Already a member?'}{' '}
        <button type="button" css={presets.linkButton} onClick={switchForm}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </form>
  );
};

const LoginSignupModal: React.FC = () => {
  const { isLoginModalOpen, toggleLoginModal } = useUserStore(
    state => ({
      isLoginModalOpen: state.isLoginModalOpen,
      toggleLoginModal: () => state.toggleLoginModal(),
    }),
    shallow,
  );
  return (
    <React.Fragment>
      <Modal open={isLoginModalOpen} onClose={toggleLoginModal}>
        <div css={presets.modalCss}>
          <LoginSignupForm />
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default LoginSignupModal;
