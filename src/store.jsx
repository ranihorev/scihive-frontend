import {applyMiddleware, createStore} from "redux";
import rootReducer from "./reducers";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";


const middlewares = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ?
  composeWithDevTools(applyMiddleware(thunk)) :
  applyMiddleware(thunk);

export const store = createStore(rootReducer, middlewares );