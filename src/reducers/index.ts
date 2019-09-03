import { combineReducers } from 'redux';

import userReducer from './reducer_user';
import paperReducer from './reducer_paper';
import papersListReducer from './reducer_papersList';

const rootReducer = combineReducers({
  user: userReducer,
  paper: paperReducer,
  papersList: papersListReducer,
});

export default rootReducer;
