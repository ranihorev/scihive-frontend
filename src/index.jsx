import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from "react-redux";
import {SET_USER} from "./actions";
import axios from "axios";
import {store} from './store';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import withTracker from "./Tracker";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;
const user = localStorage.getItem('username');

if(user) {
  store.dispatch({ type: SET_USER, payload: user });
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={withTracker(App)}/>
    </Router>
  </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
