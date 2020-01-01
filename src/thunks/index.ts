import axios from 'axios';
import { toast } from 'react-toastify';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import { FileMetadata } from '../models';
import { track } from '../Tracker';
import { eventsGenerator } from '../utils';
import { GroupColor } from '../utils/presets';

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
      document.dispatchEvent(eventsGenerator.updateLibrary({ checked }));
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

export const uploadPaperDetails = async (details: FileMetadata, onSuccess: (paperId: string) => void) => {
  try {
    track('uploadPaperMeta');
    const response = await axios.patch('/new_paper/add', details);
    onSuccess(response.data.paper_id);
  } catch (e) {
    console.error(e.response?.data?.message);
    toast.error(`Failed to upload paper details. Please try again - ${e.message}`, {
      autoClose: 3000,
    });
  }
};
