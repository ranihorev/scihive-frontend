import {
  SET_ALL_CATEGORIES,
  TOGGLE_CATEGORY,
  TOGGLE_CATEGORY_MODAL,
  SET_SELECTED_CATEGORIES,
} from '../actions/categories';

const initialState = {
  allCategories: [],
  selectedCategories: [],
  isCategoriesModalOpen: false,
};

const toggleCategory = (state, currCategoryKey) => {
  const filteredCategories = state.selectedCategories.filter(category => category !== currCategoryKey);
  if (filteredCategories.length === state.selectedCategories.length) {
    // category not selected before
    return { ...state, selectedCategories: [...state.selectedCategories, currCategoryKey] };
  }
  return { ...state, selectedCategories: filteredCategories };
};

export default function dataReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ALL_CATEGORIES:
      return { ...state, allCategories: action.payload };
    case TOGGLE_CATEGORY:
      return toggleCategory(state, action.payload);
    case TOGGLE_CATEGORY_MODAL:
      return { ...state, isCategoriesModalOpen: !state.isCategoriesModalOpen };
    case SET_SELECTED_CATEGORIES:
      return { ...state, selectedCategories: action.payload };
    default:
      return state;
  }
}
