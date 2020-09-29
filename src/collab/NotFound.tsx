/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import React from 'react';
import baseStyles from '../base.module.scss';
import { useUserNewStore } from '../stores/userNew';
import { TopBar, TopBarButton } from './topBar';

export const NotFound: React.FC = () => {
  const isLoggedIn = useUserNewStore(state => state.status === 'loggedIn');
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar rightMenu={isLoggedIn ? <TopBarButton to="/library">Library</TopBarButton> : undefined} />
      <div className={baseStyles.screenCentered}>
        <Typography variant="h3">Page Not Found :(</Typography>
      </div>
    </div>
  );
};
