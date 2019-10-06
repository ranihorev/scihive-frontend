import axios from 'axios';
import { Dispatch } from 'redux';
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
    .delete(`/groups/group/${id}/`)
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};

export const createNewGroup = (name: string, finallyCb: () => void) => (dispatch: Dispatch, getState: GetState) => {
  return axios
    .post('/groups/new', { name })
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message))
    .finally(() => {
      finallyCb();
    });
};

export const renameGroup = (id: string, name: string) => (dispatch: Dispatch, getState: GetState) => {
  return axios
    .patch(`/groups/group/${id}`, { name })
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};

export const bookmarkPaper = (paperId: string, checked: boolean) => (dispatch: Dispatch, getState: GetState) => {
  axios
    .post(`/library/${paperId}/${checked ? 'save' : 'remove'}`)
    .then(() => {
      dispatch(actions.updateBookmark({ paperId, checked }));
    })
    .catch(err => console.log(err.response));
};
