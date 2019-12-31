import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { trackerMiddleware } from './Tracker';

let middlewares = applyMiddleware(thunk, trackerMiddleware);
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  middlewares = composeWithDevTools(middlewares);
}

export const store = createStore(rootReducer, middlewares);
