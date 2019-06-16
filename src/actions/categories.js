export const SET_ALL_CATEGORIES = 'SET_ALL_CATEGORIES';
export const TOGGLE_CATEGORY = 'TOGGLE_CATEGORY';
export const TOGGLE_CATEGORY_MODAL = 'TOGGLE_CATEGORY_MODAL';
export const SET_SELECTED_CATEGORIES = 'SET_SELECTED_CATEGORIES';

export const actions = {
  setAllCategories: categories => {
    return {
      type: SET_ALL_CATEGORIES,
      payload: categories,
    };
  },
  toggleCategory: category => {
    return {
      type: TOGGLE_CATEGORY,
      payload: category,
    };
  },
  setSelectedCategories: categories => {
    return {
      type: SET_SELECTED_CATEGORIES,
      payload: categories,
    };
  },
  toggleCategoriesModal: () => {
    return {
      type: TOGGLE_CATEGORY_MODAL,
    };
  },
};
