import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axios from 'axios';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import LoginSignupModal from './components/LoginSignupModal';
import About from './pages/About';
import Admin from './pages/Admin';
import Groups from './pages/Groups';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Paper from './pages/Paper';
import chromeExtensionPopup from './utils/chromeExtension';
import { themePalette } from './utils/presets';
import { useTracker } from './Tracker';
import { Dispatch } from 'redux';
import { loadGroups } from './thunks';

const theme = createMuiTheme({
  palette: themePalette,
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },
});

const App: React.FC<{ isLoggedIn: boolean; loadGroups: () => void }> = ({ isLoggedIn, loadGroups }) => {
  React.useEffect(() => {
    if (isLoggedIn) {
      loadGroups();
    }
  }, [isLoggedIn]);

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
  useTracker();

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
          <Route path="/groups" exact component={Groups} />
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

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
  };
};

const mapDispatchToProps = (dispatch: RTDispatch) => {
  return {
    loadGroups: () => {
      dispatch(loadGroups());
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(App);
