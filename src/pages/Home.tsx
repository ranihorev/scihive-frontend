import React from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid';
import PapersList from '../components/PapersList';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';
import { PaperListDekstopMenu, PaperListMobileMenu } from '../components/TopBar/PapersListMenuBar';

const styles = () => ({
  root: {
    // backgroundColor: "lightGrey" // theme.palette.background.paper
  },
});

const Home = () => {
  return (
    <React.Fragment>
      <PrimaryAppBar desktopItems={<PaperListDekstopMenu />} mobileSubItems={<PaperListMobileMenu />} />
      <Grid container direction="row" justify="center">
        <PapersList />
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(Home);
