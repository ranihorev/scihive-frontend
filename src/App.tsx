import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
// @ts-ignore
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import Home from './pages/Home';
import Paper from './pages/Paper';
import LoginSignupModal from './components/LoginSignupModal';
import NotFound from './pages/NotFound';
import About from './pages/About';
import chromeExtensionPopup from './utils/chromeExtension';
import { themePalette } from './utils/presets';
import Admin from './pages/Admin';

const theme = createMuiTheme({
  palette: themePalette,
  typography: {},
});

const App: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get('/user/validate')
        .then(() => {})
        .catch(err => {
          if (err.response && err.response.status) {
            localStorage.removeItem('username');
            window.location.reload();
          }
        });
    }
    chromeExtensionPopup();
  }, []);

  return (
    <React.Fragment>
      <MuiThemeProvider theme={theme}>
        <LoginSignupModal />
        <Switch>
          <Route path="/library" exact component={Home} />
          <Route path="/" exact component={Home} />
          <Route path="/search/" exact component={Home} />
          <Route path="/author/:authorId" exact component={Home} />
          <Route path="/paper/:PaperId" exact component={Paper} />
          <Route path="/about" exact component={About} />
          <Route path="/admin" exact component={Admin} />
          <Route component={NotFound} />
        </Switch>
        <ToastContainer
          position="bottom-center"
          autoClose={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          draggable
        />
      </MuiThemeProvider>
    </React.Fragment>
  );
};

const mapStateToProps = (state: any) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
  };
};

const withRedux = connect(mapStateToProps);

export default withRedux(App);
