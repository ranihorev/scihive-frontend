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
    case 'ADD_PAPERS':
      const totalPapers = action.payload.total !== undefined ? action.payload.total : state.totalPapers;
      return { ...state, papers: [...state.papers, ...action.payload.papers], totalPapers };
    case 'SET_TOTAL_PAPERS':
      return { ...state, totalPapers: action.payload };
    case 'CLEAR_PAPERS':
      return { ...state, papers: [], totalPapers: 0 };
    case 'SET_ALL_CATEGORIES':
      return { ...state, allCategories: action.payload };
    case 'TOGGLE_CATEGORY':
      return toggleCategory(state, action.payload);
    case 'TOGGLE_CATEGORY_MODAL':
      return { ...state, isCategoriesModalOpen: !state.isCategoriesModalOpen };
    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.payload };
    // case 'UPDATE_BOOKMARK':
    //   return produce(state, draftState => {
    //     draftState.
    //   })
    default:
      return state;
  }
}
