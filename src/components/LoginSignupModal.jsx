// @flow

import React, {useState} from 'react';
import Modal from "@material-ui/core/Modal";
import {Button, withStyles} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import './LoginSignup.scss';
import axios from "axios";
import {actions} from "../actions";
import {connect} from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";

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
    transform: 'translate(-50%, -50%)',
  }
});

type LoginSignupProps = {
  onSubmitSuccess: () => null,
  loginModalMessage: HTMLElement | null,
}

function LoginSignupForm({onSubmitSuccess, loginModalMessage}: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({email: '', password: '', username: ''});
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e) => {
    const field = e.target.name;
    setUserData({...userData, [field]: e.target.value})
  }

  const submitForm = (e) => {
    e.preventDefault();
    setErrMsg('');
    const endpoint = '/user' + (isLogin ? '/login' : '/register');
    axios.post(endpoint, userData).then(res => {
      localStorage.setItem('username', res.data.username);
      // Redundant: keep it here in case we won't reload the page one day
      onSubmitSuccess(res.data);
      const onRefresh = (e) => {
        e.preventDefault();
        window.location.reload();
      }
      const content = <span>
        You are now logged in!<br/>
        <a href={'#'} onClick={onRefresh} style={{color: 'inherit'}}>Refresh</a> to view your data.
      </span>;
      toast.success(content);

    }).catch(err => {
      let msg = 'Failed to reach server';
      try {
        msg = err.response.data.message;
      } catch (e) {}
      setErrMsg(msg);
    })
  }

  const switchForm = (e) => {
    e.preventDefault();
    setIsLogin(!isLogin);
  }

  const title = isLogin ? "Log in" : "Sign up";
  return (
    <form onSubmit={submitForm} className='loginSignupForm'>
      <div className="title">
        {loginModalMessage ? loginModalMessage : title}
      </div>
      {
        !isLogin ? (
          <FormControl className="formControl" fullWidth>
            <InputLabel>User Name (Optional)</InputLabel>
            <Input name='username' value={userData.username} onChange={handleChange} maxLength={30} required/>
          </FormControl>
        ) : null
      }
      <FormControl className="formControl" fullWidth>
        <InputLabel>Email</InputLabel>
        <Input type='email' name='email' value={userData.email} onChange={handleChange} required/>
      </FormControl>
      <FormControl className="formControl" fullWidth>
        <InputLabel>Password</InputLabel>
        <Input name='password' value={userData.password} onChange={handleChange} type={'password'} required/>
      </FormControl>
      <div className="submit">
        <Button type="submit" variant="contained" color="primary">Submit</Button>
      </div>
      <div className="error">{errMsg}</div>
      <div className="already">{isLogin ? 'Not a member yet?' : 'Already a member?'}{' '}
      <a href="#" onClick={switchForm}>{isLogin ? 'Sign up' : 'Log in'}</a></div>
    </form>
  )
}

const LoginSignupModal = ({classes, isLoginModalOpen, toggleLoginModal, onSubmitSuccess, loginModalMessage}) => {
  return (
    <React.Fragment>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isLoginModalOpen}
        onClose={toggleLoginModal}

      >
        <div className={classes.modal}>
          <LoginSignupForm onSubmitSuccess={onSubmitSuccess} loginModalMessage={loginModalMessage}/>
        </div>
      </Modal>
    </React.Fragment>
  )
};

const mapStateToProps = (state, ownProps) => {
  const {user} = state;
  return {
    isLoginModalOpen: user.isLoginModalOpen,
    userData: user.userData,
    loginModalMessage: user.loginModalMessage,
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleLoginModal: () => {
      dispatch(actions.toggleLoginModal());
    },
    onSubmitSuccess: (data) => {
      dispatch(actions.setUser(data));
      dispatch(actions.toggleLoginModal());
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps) (withStyles(styles)(LoginSignupModal));
