import produce from 'immer';
import { RootState } from '../models';
import { PapersListActions } from '../actions/papersList';

type PapersListState = RootState['papersList'];

const initialState: PapersListState = {
  papers: [],
  totalPapers: 0,
  allCategories: [],
  selectedCategories: [],
  isCategoriesModalOpen: false,
};

const toggleCategory = (state: PapersListState, currCategoryKey: string) => {
  const filteredCategories = state.selectedCategories.filter(category => category !== currCategoryKey);
  if (filteredCategories.length === state.selectedCategories.length) {
    // category not selected before
    return { ...state, selectedCategories: [...state.selectedCategories, currCategoryKey] };
  }
  return { ...state, selectedCategories: filteredCategories };
};

export default function dataReducer(state = initialState, action: PapersListActions) {
  switch (action.type) {
    case 'addPapers':
      const totalPapers = action.payload.total !== undefined ? action.payload.total : state.totalPapers;
      return { ...state, papers: [...state.papers, ...action.payload.papers], totalPapers };
    case 'setTotalPapers':
      return { ...state, totalPapers: action.payload };
    case 'clearPapers':
      return { ...state, papers: [], totalPapers: 0 };
    case 'setAllCategories':
      return { ...state, allCategories: action.payload };
    case 'toggleCategory':
      return toggleCategory(state, action.payload);
    case 'toggleCategoriesModal':
      return { ...state, isCategoriesModalOpen: !state.isCategoriesModalOpen };
    case 'setSelectedCategories':
      return { ...state, selectedCategories: action.payload };
    case 'updateBookmark':
      return produce(state, draftState => {
        for (const paper of draftState.papers) {
          if (paper._id === action.payload.paperId) {
            paper.saved_in_library = action.payload.checked;
          }
        }
        return draftState;
      });
    case 'updatePaperGroups':
      return produce(state, draftState => {
        for (const paper of draftState.papers) {
          if (paper._id === action.payload.paperId) {
            if (action.payload.shouldAdd) {
              paper.groups.push(action.payload.groupId);
            } else {
              paper.groups = paper.groups.filter(g => g !== action.payload.groupId);
            }
          }
        }
        return draftState;
      });
    case 'setSelectedGroup':
      return { ...state, inviteGroup: action.payload };
    default:
      return state;
  }
}
