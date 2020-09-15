/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { LoginWithGoogle } from '../auth';
import { CenteredFullScreen } from './utils/CenteredFullScreen';

// This is the scope required for readonly access to contacts

export const Landing: React.FC = () => {
  return (
    <CenteredFullScreen>
      <LoginWithGoogle defaultRedirectTo="/collab/upload" />
    </CenteredFullScreen>
  );
};
