import { combineReducers } from 'redux'

import userReducer from './reducer_user';
import paperReducer from './reducer_paper';

const rootReducer = combineReducers({
  user: userReducer,
  paper: paperReducer
});

export default rootReducer


