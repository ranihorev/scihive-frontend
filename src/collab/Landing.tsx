/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link, Typography } from '@material-ui/core';
import React from 'react';
import shallow from 'zustand/shallow';
import { LoginWithGoogle } from '../auth';
import baseStyles from '../base.module.scss';
import { useUserNewStore } from '../stores/userNew';
import { TopBar, TopBarButton } from './topBar';
import { Spacer } from './utils/Spacer';

export const Landing: React.FC = () => {
  const { isLoggedIn, openLoginModal } = useUserNewStore(
    state => ({ isLoggedIn: state.status === 'loggedIn', openLoginModal: state.toggleLoginModal }),
    shallow,
  );
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar rightMenu={isLoggedIn ? <TopBarButton to="/library">Library</TopBarButton> : undefined} />
      <div className={baseStyles.screenCentered}>
        <LoginWithGoogle defaultRedirectTo="/upload" />
        <Spacer size={16} />
        <Typography variant="body2" color="textSecondary">
          <i>- or -</i>
        </Typography>
        <Spacer size={16} />
        <Link href="#" onClick={() => openLoginModal()}>
          Log in with password
        </Link>
      </div>
    </div>
  );
};
