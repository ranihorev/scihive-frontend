import axios from 'axios';
import produce from 'immer';
import { GetState } from 'zustand';
import { Category, PaperListItem } from '../models';
import { eventsGenerator } from '../utils';
import {
  AddRemoveBookmark,
  addRemoveBookmarkHelper,
  AddRemovePaperToGroup,
  addRemovePaperToGroupHelper,
  createWithDevtools,
  NamedSetState,
} from './utils';

interface PapersListState {
  papers: PaperListItem[];
  totalPapers: number;
  allCategories: Category[];
  selectedCategories: string[];
  isCategoriesModalOpen: boolean;
}

const initialState: PapersListState = {
  papers: [],
  totalPapers: 0,
  allCategories: [],
  selectedCategories: [],
  isCategoriesModalOpen: false,
};

export interface RequestParams {
  age: string;
  q: string;
  sort: string;
  author: string;
  page_num: number;
  group: string;
}

interface FetchPapers {
  url: string;
  requestParams: Partial<RequestParams>;
  setHasMorePapers: (value: boolean) => void;
  finallyCb: () => void;
}

const stateAndActions = (set: NamedSetState<PapersListState>, get: GetState<PapersListState>) => {
  const addPapersHelper = ({ papers, total }: { papers: PaperListItem[]; total?: number }) =>
    set(state => {
      const totalPapers = total !== undefined ? total : state.totalPapers;
      debugger;
      return { papers: [...state.papers, ...papers], totalPapers };
    }, 'addPapers');

  const clearPapersHelper = () => set(state => ({ papers: [], totalPapers: 0 }), 'clearPapers');

  return {
    ...initialState,
    clearPapers: () => set(state => ({ papers: [], totalPapers: 0 }), 'clearPapers'),
    fetchPapers: async ({ url, requestParams, setHasMorePapers, finallyCb }: FetchPapers) => {
      const page = requestParams.page_num;
      try {
        const result = await axios.get(url, { params: requestParams });
        const newPapers = result.data.papers;
        // Everytime we load page 0 we assume it's a new query
        if (page === 1) {
          clearPapersHelper();
        }
        addPapersHelper({ papers: newPapers, total: page === 1 ? result.data.count : undefined });
        setHasMorePapers(newPapers.length !== 0);
      } catch (e) {
        console.warn('Failed to load content', e);
        setHasMorePapers(false);
      } finally {
        finallyCb();
      }
    },
    updateBookmark: async ({ paperId, checked }: AddRemoveBookmark) => {
      try {
        addRemoveBookmarkHelper({ paperId, checked });
      } catch (err) {
        console.log(err);
        return;
      }
      set(
        produce((draftState: PapersListState) => {
          for (const paper of draftState.papers) {
            if (paper._id === paperId) {
              paper.saved_in_library = checked;
            }
          }
          return draftState;
        }),
        'updateBookmark',
      );
      document.dispatchEvent(eventsGenerator.updateLibrary({ checked }));
    },
    updatePaperGroups: (payload: AddRemovePaperToGroup) => {
      try {
        addRemovePaperToGroupHelper(payload);
      } catch (e) {
        console.log(e);
        return;
      }
      set(
        produce((draftState: PapersListState) => {
          for (const paper of draftState.papers) {
            if (paper._id === payload.paperId) {
              if (payload.shouldAdd) {
                paper.groups.push(payload.groupId);
              } else {
                paper.groups = paper.groups.filter(g => g !== payload.groupId);
              }
            }
          }
          return draftState;
        }),
        'updateGroups',
      );
    },
  };
};

export const [usePapersListStore, papersListStoreApi] = createWithDevtools(stateAndActions, 'PapersList');
