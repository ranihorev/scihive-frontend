import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles/index';
import AppBar from '@material-ui/core/AppBar/index';
import CssBaseline from '@material-ui/core/CssBaseline/index';
import Toolbar from '@material-ui/core/Toolbar/index';
import ChatIcon from '@material-ui/icons/Chat';

const styles = () => ({
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function BottomAppBar(props) {
  const { classes } = props;
  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <a
            href="https://goo.gl/forms/fiEWkXfk4hLW6i1P2"
            target="_blank"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            Take our poll
            <ChatIcon />
          </a>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export default withStyles(styles)(BottomAppBar);
