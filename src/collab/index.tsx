import { CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { Redirect, Route, RouteProps, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { REDIRECT_TO } from '../auth';
import { useIsLoggedIn } from '../auth/utils';
import baseStyles from '../base.module.scss';
import NotFound from '../pages/NotFound';
import { useUserNewStore } from '../stores/userNew';
import { Landing } from './Landing';
import { CollaboratedPdf } from './paper';
import { PapersList } from './papersList';
import { TopBar } from './topBar';
import { Upload } from './upload';
import { QueryProvider } from './utils/QueryContext';
import { Spacer } from './utils/Spacer';
import { Groups } from './groups';

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
        <Redirect to={`/collab/start?${REDIRECT_TO}=${location.pathname}`} />
      )}
    </Route>
  );
};

const Main: React.FC = () => {
  const { path } = useRouteMatch();
  useIsLoggedIn();
  return (
    <QueryProvider>
      <Switch>
        <Route path={`${path}/start`} exact>
          <Landing />
        </Route>
        <Route path={`${path}/discover`} exact>
          <PapersList />
        </Route>
        <PrivateRoute path={`${path}/library`} exact>
          <PapersList isLibraryMode />
        </PrivateRoute>
        <PrivateRoute path={`${path}/collections`} exact>
          <Groups />
        </PrivateRoute>
        <PrivateRoute path={`${path}/upload`} exact>
          <Upload />
        </PrivateRoute>
        <PrivateRoute path={`${path}/paper/:paperId/invite`} exact>
          <CollaboratedPdf showInviteOnLoad />
        </PrivateRoute>
        <PrivateRoute path={`${path}/paper/:paperId`} exact>
          <CollaboratedPdf />
        </PrivateRoute>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </QueryProvider>
  );
};

export default Main;
