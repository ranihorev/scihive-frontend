/** @jsx jsx */
import { jsx } from '@emotion/core';
import { pick } from 'lodash';
import React from 'react';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';
import { LoginWithGoogle } from '../auth';
import { useUserNewStore } from '../stores/userNew';
import { CenteredFullScreen } from './utils/CenteredFullScreen';

// This is the scope required for readonly access to contacts

export const Landing: React.FC = () => {
  const history = useHistory();
  const { status } = useUserNewStore(state => pick(state, ['status', 'profile']), shallow);

  React.useEffect(() => {
    if (status === 'loggedIn') {
      history.push('/collab/upload');
    }
  }, [history, status]);

  return (
    <CenteredFullScreen>
      <LoginWithGoogle />
    </CenteredFullScreen>
  );
};
