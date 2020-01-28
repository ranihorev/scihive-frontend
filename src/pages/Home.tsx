import Grid from '@material-ui/core/Grid';
import React from 'react';
import Helmet from 'react-helmet';
import PapersList from '../components/PapersList';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

const Home: React.FC = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>SciHive</title>
      </Helmet>
      <PrimaryAppBar />
      <Grid container direction="row" justify="center">
        <PapersList />
      </Grid>
    </React.Fragment>
  );
};

export default Home;
