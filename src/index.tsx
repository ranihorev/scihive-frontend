import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import axios from 'axios';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import App from './App';
import { store } from './store';
import './index.css';
import { actions } from './actions';

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production')
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;
const user = localStorage.getItem('username');

if (user) {
  store.dispatch(actions.setUser({ username: user }));
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={App} />
    </Router>
  </Provider>,
  document.getElementById('root'),
);
