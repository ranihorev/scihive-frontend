import { Category, PaperListItem, Group } from '../models';

export const actions = {
  addPapers: (payload: { papers: PaperListItem[]; total?: number }) => ({
    type: 'addPapers' as const,
    payload: payload,
  }),
  setTotalPapers: (total: number) => ({
    type: 'setTotalPapers' as const,
    payload: total,
  }),
  clearPapers: () => ({
    type: 'clearPapers' as const,
  }),
  setAllCategories: (categories: Category[]) => {
    return {
      type: 'setAllCategories' as const,
      payload: categories,
    };
  },
  toggleCategory: (category: string) => {
    return {
      type: 'toggleCategory' as const,
      payload: category,
    };
  },
  setSelectedCategories: (categories: string[]) => {
    return {
      type: 'setSelectedCategories' as const,
      payload: categories,
    };
  },
  toggleCategoriesModal: () => {
    return {
      type: 'toggleCategoriesModal' as const,
      payload: {},
    };
  },
  updateBookmark: (payload: { paperId: string; checked: boolean }) => {
    return {
      type: 'updateBookmark' as const,
      payload,
    };
  },
  updatePaperGroups: (payload: { paperId: string; groupId: string; shouldAdd: boolean }) => ({
    type: 'updatePaperGroups' as const,
    payload,
  }),
  setSelectedGroup: (group: Group | undefined) => ({
    type: 'setSelectedGroup' as const,
    payload: group,
  }),
};

export type PapersListActionKeys = keyof typeof actions;
export type PapersListActions = ReturnType<typeof actions[keyof typeof actions]>;
export type PapersListAction<T extends PapersListActionKeys> = ReturnType<typeof actions[T]>;
