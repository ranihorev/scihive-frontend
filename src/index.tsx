import * as Sentry from '@sentry/browser';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './App';
import './index.css';
import { store } from './store';
import { userStoreApi } from './stores/user';

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production')
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;
const user = localStorage.getItem('username');

if (user) {
  userStoreApi.setState({ userData: { username: user } });
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={App} />
    </Router>
  </Provider>,
  document.getElementById('root'),
);
