import { RootState } from '../models';
import { Action } from '../actions';

type PapersListState = RootState['papersList'];

const initialState: PapersListState = {
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

export default function dataReducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'SET_ALL_CATEGORIES':
      return { ...state, allCategories: action.payload };
    case 'TOGGLE_CATEGORY':
      return toggleCategory(state, action.payload);
    case 'TOGGLE_CATEGORY_MODAL':
      return { ...state, isCategoriesModalOpen: !state.isCategoriesModalOpen };
    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.payload };
    default:
      return state;
  }
}
