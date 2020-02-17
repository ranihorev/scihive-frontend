/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import GroupsList from '../components/Groups/GroupsList';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';
import Helmet from 'react-helmet';

const Home = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>My Collections</title>
      </Helmet>
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
