/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, FormControl, Input, InputLabel } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ProfileResponse, useUserStore } from '../stores/user';
import { track } from '../Tracker';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';
import { storeUserLocally, useRedirectTo } from './utils';

export const PasswordLoginForm: React.FC<{
  defaultRedirectTo?: string;
  enableRedirect?: boolean;
  onSuccess?: () => void;
}> = ({ defaultRedirectTo, enableRedirect = true, onSuccess }) => {
  const setProfile = useUserStore(state => state.setProfile);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errMsg, setErrMsg] = useState('');
  const onRedirect = useRedirectTo(defaultRedirectTo, enableRedirect);

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
        onSuccess?.();
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
    <form onSubmit={submitForm} className={styles.passwordForm}>
      <FormControl fullWidth>
        <InputLabel>Email</InputLabel>
        <Input type="email" name="email" value={userData.email} onChange={handleChange} required autoFocus />
      </FormControl>
      <Spacer size={20} />
      <FormControl fullWidth>
        <InputLabel>Password</InputLabel>
        <Input name="password" value={userData.password} onChange={handleChange} type="password" required />
      </FormControl>
      <Spacer size={20} />
      <Button type="submit" variant="contained" color="primary" className={styles.submitButton}>
        Submit
      </Button>
      <div className={styles.errorMsg}>{errMsg}</div>
    </form>
  );
};
