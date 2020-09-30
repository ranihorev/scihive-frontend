/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import shallow from 'zustand/shallow';
import { LoginForm } from './auth/LoginForm';
import baseStyles from './base.module.scss';
import { useUserStore } from './stores/user';
import { TopBar, TopBarButton } from './topBar';

export const Landing: React.FC = () => {
  const { isLoggedIn } = useUserStore(state => ({ isLoggedIn: state.status === 'loggedIn' }), shallow);
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar rightMenu={isLoggedIn ? <TopBarButton to="/library">Library</TopBarButton> : undefined} />
      <div className={baseStyles.screenCentered}>
        <LoginForm />
      </div>
    </div>
  );
};
