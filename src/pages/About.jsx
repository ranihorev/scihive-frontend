import React from "react";
import PapersList from "../components/PapersList";
import { withStyles } from "@material-ui/core/styles/index";
import Grid from "@material-ui/core/Grid";
import PrimaryAppBar from "../components/TopBar/PrimaryAppBar";

const styles = theme => ({
  root: {
    maxWidth: 992,
    padding: 20,
    lineHeight: 1.8,
    fontSize: 16,
    margin: 'auto',
  },
});

const About = ({classes}) => {
  return (
    <React.Fragment>
      <PrimaryAppBar />
      <Grid container className={classes.root}>
        <Grid container direction={"row"} justify={"center"}>
        <Grid item>
        <div>
          <p>Welcome,</p>

          <p>Scientific research has gone a long way since the scientific revolution started in the 16th century. While many processes like peer reviewed publications are finally streamlined, a significant part of research endeavors suffers from inefficiencies. These inefficiencies, if addressed, can accelerate the rate, quality and novelty of scientific discoveries.</p>

          <p>SciHive is a free, open-source tool that is built by researchers for researchers.</p>

          <p>Our mission is to leverage technology to accelerate the pace of research and scientific progress.</p>

          <p>If you would like to join our team or suggest feedback, please email us at hello(@)scihive.org</p>

          <p>Curiousity starts here.</p>

          <br/>

          <p><small>Credits: SciHive was initially forked from <a href="http://www.arxiv-sanity.com" target="_blank">Arxiv-Sanity.com</a> by Andrej Karpathy.</small></p>
        </div>
        </Grid>
      </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default withStyles(styles)(About);
