import { Category, PaperListItem } from '../models';

export const actions = {
  addPapers: (payload: { papers: PaperListItem[]; total?: number }) => ({
    type: 'ADD_PAPERS' as const,
    payload: payload,
  }),
  setTotalPapers: (total: number) => ({
    type: 'SET_TOTAL_PAPERS' as const,
    payload: total,
  }),
  clearPapers: () => ({
    type: 'CLEAR_PAPERS' as const,
  }),
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

export type PapersListActions = ReturnType<typeof actions[keyof typeof actions]>;
