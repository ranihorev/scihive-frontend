import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import axios from 'axios';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { SET_USER } from './actions';
import { store } from './store';
import { withTracker } from './Tracker';
import './index.css';

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production')
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;
const user = localStorage.getItem('username');

if (user) {
  store.dispatch({ type: SET_USER, payload: user });
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={withTracker(App)} />
    </Router>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
