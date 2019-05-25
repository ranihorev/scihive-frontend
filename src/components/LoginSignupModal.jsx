/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import { Button, withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import axios from 'axios';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { actions } from '../actions';
import * as presets from '../utils/presets';

const styles = theme => ({
  modal: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    maxWidth: '75%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
});

const formControl = css`
  margin-top: 20px;
`;

function LoginSignupForm({ onSubmitSuccess, loginModalMessage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [errMsg, setErrMsg] = useState('');

  const handleChange = e => {
    const field = e.target.name;
    setUserData({ ...userData, [field]: e.target.value });
  };

  const submitForm = e => {
    e.preventDefault();
    setErrMsg('');
    const endpoint = `/user${isLogin ? '/login' : '/register'}`;
    axios
      .post(endpoint, userData)
      .then(res => {
        localStorage.setItem('username', res.data.username);
        // Redundant: keep it here in case we won't reload the page one day
        onSubmitSuccess(res.data);
        const onRefresh = refreshEvent => {
          refreshEvent.preventDefault();
          window.location.reload();
        };
        const content = (
          <span>
            You are now logged in!
            <br />
            <button
              type="button"
              css={presets.linkButton}
              onClick={onRefresh}
              style={{ color: 'inherit' }}
            >
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

  const switchForm = e => {
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
          <Input
            name="username"
            value={userData.username}
            onChange={handleChange}
            maxLength={30}
            required
          />
        </FormControl>
      ) : null}
      <FormControl css={formControl} fullWidth>
        <InputLabel>Email</InputLabel>
        <Input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          required
        />
      </FormControl>
      <FormControl css={formControl} fullWidth>
        <InputLabel>Password</InputLabel>
        <Input
          name="password"
          value={userData.password}
          onChange={handleChange}
          type="password"
          required
        />
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
}

const LoginSignupModal = ({
  classes,
  isLoginModalOpen,
  toggleLoginModal,
  onSubmitSuccess,
  loginModalMessage
}) => {
  return (
    <React.Fragment>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isLoginModalOpen}
        onClose={toggleLoginModal}
      >
        <div className={classes.modal}>
          <LoginSignupForm
            onSubmitSuccess={onSubmitSuccess}
            loginModalMessage={loginModalMessage}
          />
        </div>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  const { user } = state;
  return {
    isLoginModalOpen: user.isLoginModalOpen,
    userData: user.userData,
    loginModalMessage: user.loginModalMessage
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
    onSubmitSuccess: data => {
      dispatch(actions.setUser(data));
      dispatch(actions.toggleLoginModal());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LoginSignupModal));
