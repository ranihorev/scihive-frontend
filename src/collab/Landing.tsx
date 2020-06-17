/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useHistory } from 'react-router';
import { LoginWithGoogle } from '../auth';
import { useIsLoggedIn } from '../auth/utils';
import { CenteredFullScreen } from './utils/CenteredFullScreen';

// This is the scope required for readonly access to contacts

export const Landing: React.FC = () => {
  const history = useHistory();
  const loginStatus = useIsLoggedIn();

  const onLogin = React.useCallback(() => {
    history.push('/collab/upload');
  }, [history]);

  React.useEffect(() => {
    if (loginStatus === 'loggedIn') {
      onLogin();
    }
  }, [loginStatus, onLogin]);

  return (
    <CenteredFullScreen>
      <LoginWithGoogle
        onSuccess={() => {
          onLogin();
        }}
      />
    </CenteredFullScreen>
  );
};
