import { RootState } from '../models';
import { Dispatch } from 'redux';
import axios from 'axios';
import { actions } from '../actions';

export const loadGroups = () => (dispatch: Dispatch, getState: GetState) => {
  axios
    .get('/groups/all')
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};

export const deleteGroup = (id: string) => (dispatch: Dispatch, getState: GetState) => {
  axios
    .delete('/groups/group', { params: { id } })
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};

export const createNewGroup = (name: string, finallyCb: () => void) => (dispatch: Dispatch, getState: GetState) => {
  return axios
    .post('/groups/group', { name })
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message))
    .finally(() => {
      finallyCb();
    });
};
