import {composeWithDevTools} from "redux-devtools-extension";
import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";


const middlewares = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ?
  composeWithDevTools(applyMiddleware(thunk)) :
  applyMiddleware(thunk);

export const store = createStore(rootReducer, middlewares );