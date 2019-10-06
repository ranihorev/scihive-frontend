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

export interface RequestParams {
  age: string;
  q: string;
  sort: string;
  author: string;
  page_num: number;
}

const MAX_RETRIES = 3;

export const fetchPapers = ({
  url,
  requestParams,
  setHasMorePapers,
  finallyCb,
}: {
  url: string;
  requestParams: Partial<RequestParams>;
  setHasMorePapers: (value: boolean) => void;
  finallyCb: () => void;
}) => async (dispatch: Dispatch, getState: GetState) => {
  const numRetries = 0;
  const page = requestParams.page_num;
  let shouldRetry = true;
  const fetchHelper = () => {
    axios
      .get(url, { params: requestParams })
      .then(result => {
        const newPapers = result.data.papers;
        // Everytime we load page 0 we assume it's a new query
        if (page === 1) {
          dispatch(actions.clearPapers());
        }
        dispatch(actions.addPapers({ papers: newPapers, total: page === 1 ? result.data.count : undefined }));
        setHasMorePapers(newPapers.length !== 0);
      })
      .catch(e => {
        console.warn('Failed to load content', e);
        setHasMorePapers(false);
      })
      .finally(() => {
        finallyCb();
      });
  };
  fetchHelper();
};
