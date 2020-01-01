import { combineReducers } from 'redux';

import paperReducer from './reducer_paper';
import papersListReducer from './reducer_papersList';

const rootReducer = combineReducers({
  paper: paperReducer,
  papersList: papersListReducer,
});

export default rootReducer;
