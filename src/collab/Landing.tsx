/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { LoginWithGoogle } from '../auth';
import baseStyles from '../base.module.scss';
import { useUserNewStore } from '../stores/userNew';
import { Link as RouterLink } from 'react-router-dom';
import { TopBar } from './topBar';
import { Button } from '@material-ui/core';

export const Landing: React.FC = () => {
  const isLoggedIn = useUserNewStore(state => state.status === 'loggedIn');
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          isLoggedIn ? (
            <Button component={RouterLink} to="/collab/library" color="inherit">
              Library
            </Button>
          ) : (
            undefined
          )
        }
      />
      <div className={baseStyles.screenCentered}>
        <LoginWithGoogle defaultRedirectTo="/collab/upload" />
      </div>
    </div>
  );
};
