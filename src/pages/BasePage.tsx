import Grid from '@material-ui/core/Grid';
import React from 'react';
import Helmet from 'react-helmet';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

export const BasePage: React.FC<{ title: string }> = ({ children, title }) => {
  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PrimaryAppBar />
      <Grid container direction="row" justify="center">
        {children}
      </Grid>
    </React.Fragment>
  );
};
