import { Category } from '../models';

export const actions = {
  setAllCategories: (categories: Category[]) => {
    return {
      type: 'SET_ALL_CATEGORIES' as const,
      payload: categories,
    };
  },
  toggleCategory: (category: string) => {
    return {
      type: 'TOGGLE_CATEGORY' as const,
      payload: category,
    };
  },
  setSelectedCategories: (categories: string[]) => {
    return {
      type: 'SET_SELECTED_CATEGORIES' as const,
      payload: categories,
    };
  },
  toggleCategoriesModal: () => {
    return {
      type: 'TOGGLE_CATEGORY_MODAL' as const,
      payload: {},
    };
  },
  updateBookmark: (payload: { paperId: string; checked: boolean }) => {
    return {
      type: 'UPDATE_BOOKMARK' as const,
      payload: payload,
    };
  },
};
