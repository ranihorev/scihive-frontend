import { CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { Redirect, Route, RouteProps, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { REDIRECT_TO } from '../auth';
import { useIsLoggedIn } from '../auth/utils';
import baseStyles from '../base.module.scss';
import { useUserNewStore } from '../stores/userNew';
import { Groups } from './groups';
import { Landing } from './Landing';
import { NotFound } from './NotFound';
import { CollaboratedPdf } from './paper';
import { PapersList } from './papersList';
import { TopBar } from './topBar';
import { Upload } from './upload';
import { QueryProvider } from './utils/QueryContext';
import { Spacer } from './utils/Spacer';

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

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const user = useUserNewStore();
  const location = useLocation();
  return (
    <Route {...rest}>
      {user.status === 'loggedIn' ? (
        children
      ) : user.status === 'loggingIn' ? (
        <LoggingIn />
      ) : (
        <Redirect to={`/start?${REDIRECT_TO}=${location.pathname}`} />
      )}
    </Route>
  );
};

export const Main: React.FC = () => {
  useIsLoggedIn();
  return (
    <QueryProvider>
      <Switch>
        <Route path="/" exact>
          <Landing />
        </Route>
        <Route path="/start" exact>
          <Landing />
        </Route>
        <Route path="/discover" exact>
          <PapersList />
        </Route>
        <PrivateRoute path="/library" exact>
          <PapersList isLibraryMode />
        </PrivateRoute>
        <PrivateRoute path="/collections" exact>
          <Groups />
        </PrivateRoute>
        <PrivateRoute path="/upload" exact>
          <Upload />
        </PrivateRoute>
        <PrivateRoute path="/paper/:paperId/invite" exact>
          <CollaboratedPdf showInviteOnLoad />
        </PrivateRoute>
        <PrivateRoute path="/paper/:paperId" exact>
          <CollaboratedPdf />
        </PrivateRoute>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </QueryProvider>
  );
};
