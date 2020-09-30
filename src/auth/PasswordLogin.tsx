/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, FormControl, Input, InputLabel } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ProfileResponse, useUserStore } from '../stores/user';
import { track } from '../Tracker';
import { Spacer } from '../utils/Spacer';
import { storeUserLocally, useRedirectTo } from './utils';

export const PasswordLoginForm: React.FC<{ defaultRedirectTo?: string }> = ({ defaultRedirectTo }) => {
  const setProfile = useUserStore(state => state.setProfile);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errMsg, setErrMsg] = useState('');
  const onRedirect = useRedirectTo(defaultRedirectTo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name;
    setUserData({ ...userData, [field]: e.target.value });
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    axios
      .post<ProfileResponse>('/user/login', userData)
      .then(res => {
        track('Login');
        setProfile(res.data);
        storeUserLocally('Password');
        onRedirect();
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
        Log in
      </div>
      <Spacer size={20} />
      <FormControl fullWidth>
        <InputLabel>Email</InputLabel>
        <Input type="email" name="email" value={userData.email} onChange={handleChange} required />
      </FormControl>
      <Spacer size={20} />
      <FormControl fullWidth>
        <InputLabel>Password</InputLabel>
        <Input name="password" value={userData.password} onChange={handleChange} type="password" required />
      </FormControl>
      <Spacer size={20} />
      <div
        css={css`
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
