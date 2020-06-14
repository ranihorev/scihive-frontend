import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Landing } from './Landing';
import { Upload } from './Upload';
import NotFound from '../pages/NotFound';

const Main: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/start`} exact component={Landing} />
      <Route path={`${path}/upload`} exact component={Upload} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Main;
