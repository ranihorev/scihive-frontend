/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, FormControl, Input, InputLabel, Modal } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import { RootState } from '../models';
import * as presets from '../utils/presets';

const formControl = css`
  margin-top: 20px;
`;

interface LoginSignupFormProps {
  onSubmitSuccess: (data: { username: string }) => void;
  loginModalMessage?: string;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ onSubmitSuccess, loginModalMessage = '' }) => {
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
    const endpoint = `/user${isLogin ? '/login' : '/register'}`;
    axios
      .post(endpoint, userData)
      .then(res => {
        localStorage.setItem('username', res.data.username);
        // Redundant: keep it here in case we won't reload the page one day
        onSubmitSuccess(res.data);
        const onRefresh = (refreshEvent: React.MouseEvent) => {
          refreshEvent.preventDefault();
          window.location.reload();
        };
        const content = (
          <span>
            You are now logged in!
            <br />
            <button type="button" css={presets.linkButton} onClick={onRefresh} style={{ color: 'inherit' }}>
              Refresh
            </button>{' '}
            to view your data.
          </span>
        );
        toast.success(content);
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

interface LoginSignupModalProps {
  isLoginModalOpen: boolean;
  toggleLoginModal: () => void;
  onSubmitSuccess: (data: { username: string }) => void;
  loginModalMessage?: string;
}

const LoginSignupModal: React.FC<LoginSignupModalProps> = ({
  isLoginModalOpen,
  toggleLoginModal,
  onSubmitSuccess,
  loginModalMessage,
}) => {
  return (
    <React.Fragment>
      <Modal open={isLoginModalOpen} onClose={toggleLoginModal}>
        <div css={presets.modalCss}>
          <LoginSignupForm onSubmitSuccess={onSubmitSuccess} loginModalMessage={loginModalMessage} />
        </div>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state;
  return {
    isLoginModalOpen: user.isLoginModalOpen,
    userData: user.userData,
    loginModalMessage: user.loginModalMessage,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
    onSubmitSuccess: (data: { username: string }) => {
      dispatch(actions.setUser(data));
      dispatch(actions.toggleLoginModal());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginSignupModal);
