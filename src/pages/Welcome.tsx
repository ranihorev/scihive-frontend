import React from 'react';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import EmailIcon from '@material-ui/icons/Email';
import TwitterIcon from '@material-ui/icons/Twitter';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  toolbar: {
    backgroundColor: 'white',
    minHeight: 64,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  header: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  features: {
    backgroundColor: '#FCFCFC',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%'
  },
  slogan: {
    color: 'white',
    position: 'absolute',
  },
  description: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '80px',
    marginBottom: '80px',
  },
  blueBanner: {
    backgroundColor: '#36a0f5',
    color: 'white',
    width: '100%',
    paddingTop: '50px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center'
  },
  horizontal: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    color: 'black',
    alignItems: 'center',
    paddingLeft: '5%',
    paddingRight: '5%'
  },
  sectionTitle: {
    paddingBottom: '5%'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureGif: {
    borderRadius: 3,
    border: "1px solid",
    borderColor: '#36a0f5'
  }
}));

const Welcome = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <AppBar position="static">
        <div className={classes.horizontal}>
          <Toolbar className={classes.toolbar}>
            <img src="logo_white.png" alt="Logo" height="70" />
          </Toolbar>
          <Typography>
          Get started
          </Typography>
        </div>
      </AppBar>

      <div className={classes.header}>
        <img src="blue_hive_bg.png" alt="Blue background" width="100%" />
        <Typography variant="h3" component="h2" className={classes.slogan}>Smarter Science Together</Typography>
      </div>

      <div className={classes.description}>
        <Typography variant="h6" component="h3">SciHive is a free and open-source tool to collaboratively read papers.</Typography><br />
        <Typography variant="h6" component="h3">Our mission is to leverage technology to accelerate the pace of research and scientific discovery.</Typography><br />
        Get started
      </div>

      <div className={classes.features}>

        <Typography variant="h4" component="h3" className={classes.sectionTitle}>Features</Typography>
        <Grid container direction="row" justify="center" spacing={4} alignItems="center">
          <Grid item xs={4}>
            <div className={classes.center}>
              <Typography variant="h6" component="h3">Collaborate</Typography><br />
              <Typography variant="body1" component="body">Read the papers you care about collaboratively.<br />Add questions, comments, and highlights.</Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <img className={classes.featureGif} src="Collaborate.gif" alt="Collaborate" width="400px" />
          </Grid>
        </Grid>
        <br /><br /><br />

        <Grid container direction="row" justify="center" spacing={4} alignItems="center">
          <Grid item xs={4}>
            <img className={classes.featureGif} src="Navigate.gif" alt="Navigate" width="400px" />
          </Grid>
          <Grid item xs={4}>
            <div className={classes.center}>
              <Typography variant="h6" component="h3">Navigate</Typography><br />
              <Typography variant="body1" component="body">Start navigating papers like a champ.<br /><br />Access references by the click of a button, instead of searching the literature manually.<br />SciHive also generates a convenient table of contents and deciphers acronyms automatically for you.</Typography>
            </div>
          </Grid>
        </Grid>
        <br /><br /><br />

        <Grid container direction="row" justify="center" spacing={4} alignItems="center">
          <Grid item xs={4}>
            <div className={classes.center}>
              <Typography variant="h6" component="h3">Organize</Typography><br />
              <Typography variant="body1" component="body">SciHive lets you create your own papers library.<br />Organize papers in collections for easy and efficient access for yourself and your peers.</Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <img className={classes.featureGif} src="Organize.gif" alt="Organize" width="400px" />
          </Grid>
        </Grid>

      </div>

      <div className={classes.description}>
        <Typography variant="h4" component="h3">Used by top scientists in top institutes.</Typography><br />
        <Grid container direction="row" justify="center" spacing={10}>
          <Grid item>
          <img src="institutes_logos/princeton.png" alt="Princeton" width="auto" height="130px" />
          </Grid>
          <Grid item>
          <img src="institutes_logos/stanford.png" alt="Stanford" width="auto" height="130px"  />
          </Grid>
          <Grid item>
          <img src="institutes_logos/harvard.png" alt="Harvard" width="auto" height="130px" />
          </Grid>
          <Grid item>
          <img src="institutes_logos/berkeley.png" alt="Berkeley" width="auto" height="130px" />
          </Grid>
        </Grid>
      </div>

      <div className={classes.blueBanner} >
        <div>
          <Typography variant="h4" component="h3">Download our Chrome extension<br />to use SciHive for all of your papers</Typography>
        </div>
        <div>
          <a href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai?hl=en" target="_blank" rel="noopener noreferrer">
            <img src="chrome_logo.png" alt="Chrome" width="70%" />
          </a>
        </div>
      </div>

      <div className={classes.description}>
        <img src="logo_white.png" alt="Logo" height="70" />
        <Typography variant="body1" component="body">&copy;	2020 SciHive.Org</Typography>

        <div>
          <IconButton aria-label="E-mail us">
            <a href="mailto:hello@scihive.org">
              <EmailIcon fontSize="large" />
            </a>
          </IconButton>
          <IconButton aria-label="Follow SciHive on Twitter">
            <a href="https://twitter.com/SciHiveOrg" target="_blank" rel="noopener noreferrer">
              <TwitterIcon fontSize="large" />
            </a>
          </IconButton>
        </div>

      </div>
    </React.Fragment>
  );
};

export default Welcome;
