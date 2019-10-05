/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import GroupsList from '../components/GroupsList';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

const Home = () => {
  return (
    <React.Fragment>
      <PrimaryAppBar />
      <Grid
        container
        direction="row"
        justify="center"
        css={css`
          max-width: 992px;
          padding: 20px;
          margin: auto;
        `}
      >
        <GroupsList />
      </Grid>
    </React.Fragment>
  );
};

export default Home;
