import React from "react";
import PapersList from "../components/PapersList";
import { withStyles } from "@material-ui/core/styles/index";
import Grid from "@material-ui/core/Grid";
import PrimaryAppBar from "../components/TopBar/PrimaryAppBar";
import {PaperDekstopMenu, PaperMobileMenu} from "../components/TopBar/PapersListMenuBar";

const styles = theme => ({
  root: {
    // backgroundColor: "lightGrey" // theme.palette.background.paper
  }
});

const Home = props => {
  return (
    <React.Fragment>
      <PrimaryAppBar
        desktopItems={<PaperDekstopMenu/>}
        mobileSubItems={<PaperMobileMenu />}
      />
      <Grid container direction={"row"} justify={"center"}>
        <PapersList />
      </Grid>
    </React.Fragment>
  );
}

export default withStyles(styles)(Home);
