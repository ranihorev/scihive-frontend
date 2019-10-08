import axios from 'axios';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import { Group } from '../models';

export const loadGroups = (onSuccess: (groups: Group[]) => void) => (dispatch: Dispatch, getState: GetState) => {
  axios
    .get('/groups/all')
    .then(res => {
      dispatch(actions.setGroups(res.data));
      onSuccess(res.data);
    })
    .catch(e => console.warn(e.message));
};

export const joinGroup = (groupId: string, onSuccess: (group: Group) => void, onFail: () => void) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  axios
    .post('/groups/all', { id: groupId })
    .then(res => {
      dispatch(actions.setGroups(res.data));
      const newGroup = (res.data as Group[]).find(g => g.id === groupId);
      if (newGroup) {
        onSuccess(newGroup);
      } else {
        console.warn('Group not found in the new list');
      }
    })
    .catch(e => {
      console.warn(e.message);
      onFail();
    });
};

export const deleteGroup = (id: string) => (dispatch: Dispatch, getState: GetState) => {
  axios
    .delete(`/groups/group/${id}`)
    .then(res => {
      dispatch(actions.setGroups(res.data));
    })
    .catch(e => console.warn(e.message));
};

export const createNewGroup = (payload: { name: string; finallyCb?: () => void; onSuccessCb?: () => void }) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const { name, onSuccessCb, finallyCb } = payload;
  return axios
    .post('/groups/new', { name })
    .then(res => {
      dispatch(actions.setGroups(res.data));
      onSuccessCb && onSuccessCb();
    })
    .catch(e => console.warn(e.message))
    .finally(() => {
      finallyCb && finallyCb();
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

export const bookmarkPaper = (type: 'single' | 'list', paperId: string, checked: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  axios
    .post(`/library/${paperId}/${checked ? 'save' : 'remove'}`)
    .then(() => {
      if (type === 'list') {
        dispatch(actions.updateBookmark({ paperId, checked }));
      } else {
        dispatch(actions.setBookmark(checked));
      }
    })
    .catch(err => console.log(err));
};

export const addRemovePaperToGroup = (payload: {
  type: 'single' | 'list';
  paperId: string;
  shouldAdd: boolean;
  groupId: string;
}) => (dispatch: Dispatch, getState: GetState) => {
  const { type, paperId, groupId, shouldAdd } = payload;
  axios
    .post(`/groups/group/${groupId}`, { paper_id: paperId, add: Number(shouldAdd) })
    .then(() => {
      if (type === 'list') {
        dispatch(actions.updatePaperGroups(payload));
      } else {
        dispatch(actions.addRemoveGroupIds({ groupIds: [groupId], shouldAdd }));
      }
    })
    .catch(err => console.log(err));
};

export interface RequestParams {
  age: string;
  q: string;
  sort: string;
  author: string;
  page_num: number;
  group: string;
}

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
  const page = requestParams.page_num;
  // TODO: add retries
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
