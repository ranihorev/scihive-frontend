/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link, Typography } from '@material-ui/core';
import React from 'react';
import { LoginWithGoogle } from './Google';
import { Spacer } from '../utils/Spacer';
import { PasswordLoginForm } from './PasswordLogin';
import styles from './styles.module.scss';

const defaultRedirectTo = '/upload';

export const LoginForm: React.FC = () => {
  const [showLoginViaPassword, setShowLoginViaPassword] = React.useState(false);
  return (
    <div className={styles.loginForm}>
      <LoginWithGoogle {...{ defaultRedirectTo }} />
      <Spacer size={16} />
      <Typography variant="body2" color="textSecondary">
        <i>- or -</i>
      </Typography>
      <Spacer size={16} />
      {showLoginViaPassword ? (
        <PasswordLoginForm {...{ defaultRedirectTo }} />
      ) : (
        <Link href="#" onClick={() => setShowLoginViaPassword(true)}>
          Log in with password
        </Link>
      )}
    </div>
  );
};
