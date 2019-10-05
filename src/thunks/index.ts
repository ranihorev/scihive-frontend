import { RootState } from '../models';
import { Dispatch } from 'redux';
import axios from 'axios';
import { actions } from '../actions';

type GetState = () => RootState;
export const loadGroups = () => (dispatch: Dispatch, getState: GetState) => {
  axios
    .get('/groups/all')
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};
