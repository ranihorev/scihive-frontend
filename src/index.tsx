import * as Sentry from '@sentry/react';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './App';
import './index.css';

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production')
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;

ReactDOM.render(
  <Router>
    <Route component={App} />
  </Router>,
  document.getElementById('root'),
);
