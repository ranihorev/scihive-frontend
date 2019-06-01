import React from 'react';
import Grid from '@material-ui/core/Grid';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';
import { AddAcronym } from '../admin/AcronymsManager';

const Admin = () => {
  return (
    <React.Fragment>
      <PrimaryAppBar />
      <Grid container direction="row" justify="center">
        <Grid>
          <AddAcronym />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Admin;
