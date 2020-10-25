import { CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router';
import { REDIRECT_TO } from './utils';
import baseStyles from '../base.module.scss';
import { useUserStore } from '../stores/user';
import { TopBar } from '../topBar';
import { Spacer } from '../utils/Spacer';

const LoggingIn: React.FC = () => {
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar />
      <div className={baseStyles.screenCentered}>
        <Typography>Logging in</Typography>
        <Spacer size={8} />
        <CircularProgress />
      </div>
    </div>
  );
};

export const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const user = useUserStore();
  const location = useLocation();
  return (
    <Route {...rest}>
      {user.status === 'loggedIn' ? (
        children
      ) : user.status === 'loggingIn' ? (
        <LoggingIn />
      ) : (
        <Redirect to={`/start?${REDIRECT_TO}=${location.pathname + location.search}`} />
      )}
    </Route>
  );
};
