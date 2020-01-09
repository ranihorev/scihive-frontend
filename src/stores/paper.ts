import axios from 'axios';
import produce from 'immer';
import { isEmpty } from 'lodash';
import { GetState } from 'zustand';
import {
  Acronyms,
  CodeMeta,
  PaperJump,
  References,
  Section,
  SidebarTab,
  T_Highlight,
  Visibility,
  SidebarCommentJump,
} from '../models';
import {
  AddRemoveBookmark,
  addRemoveBookmarkHelper,
  AddRemovePaperToGroup,
  addRemovePaperToGroupHelper,
  createWithDevtools,
  NamedSetState,
} from './utils';

export interface PaperState {
  readingProgress: number;
  isBookmarked: boolean;
  sections?: Section[];
  references: References;
  highlights: T_Highlight[];
  hiddenHighlights: T_Highlight[];
  acronyms: Acronyms;
  sidebarTab: SidebarTab;
  sidebarJumpData?: SidebarCommentJump;
  paperJumpData?: PaperJump;
  codeMeta?: CodeMeta;
  groupIds: string[];
  commentVisibilty: Visibility;
}

const initialState: PaperState = {
  readingProgress: 0,
  isBookmarked: false,
  references: {},
  highlights: [],
  hiddenHighlights: [],
  acronyms: {},
  sidebarTab: 'Sections',
  groupIds: [],
  commentVisibilty: { type: 'public' },
};

interface FetchPaperResponse {
  url: string;
  saved_in_library: boolean;
  title: string;
  code?: CodeMeta;
  groups: string[];
}

const stateAndActions = (set: NamedSetState<PaperState>, get: GetState<PaperState>) => {
  const fetchComments = async (paperId: string) => {
    try {
      const res = await axios.get(`/paper/${paperId}/comments`);
      set({ highlights: res.data.comments });
    } catch (err) {
      console.warn(err.response);
    }
  };
  const fetchAcronyms = async (paperId: string) => {
    try {
      const res = await axios.get(`/paper/${paperId}/acronyms`);
      set({ acronyms: res.data }, 'setAcronyms');
    } catch (err) {
      console.warn(err.response);
    }
  };

  const fetchReferences = async (paperId: string) => {
    try {
      const res = await axios.get(`/paper/${paperId}/references`);
      set({ references: res.data }, 'setReferences');
    } catch (err) {
      console.warn(err.response);
    }
  };

  const updateHighlightHelper = (newHighlight: T_Highlight) => {
    set(
      state => ({ highlights: state.highlights.map(h => (h.id === newHighlight.id ? newHighlight : h)) }),
      'updateHighlight',
    );
  };

  return {
    ...initialState,
    updatePaperGroups: (payload: AddRemovePaperToGroup) => {
      try {
        addRemovePaperToGroupHelper(payload);
      } catch (e) {
        console.log(e);
        return;
      }
      set(
        state =>
          produce(state, draftState => {
            if (payload.shouldAdd) {
              draftState.groupIds.push(payload.groupId);
            } else {
              draftState.groupIds = draftState.groupIds.filter(g => g !== payload.groupId);
            }
          }),
        'updateGroups',
      );
    },
    updateBookmark: async ({ paperId, checked }: AddRemoveBookmark) => {
      try {
        addRemoveBookmarkHelper({ paperId, checked });
      } catch (err) {
        console.log(err);
        return;
      }
      set(state => ({ isBookmarked: checked }), 'updateBookmark');
    },
    clearPaper: () => set(initialState, 'clearPaper'),
    updateReadingProgress: (progress: number) => set({ readingProgress: progress }),
    setPaper: (newPaper: Partial<PaperState>) => set(newPaper, 'setPaper'),
    toggleHighlightsVisiblity: () => {
      if (isEmpty(get().hiddenHighlights)) {
        set(state => ({ highlights: [], hiddenHighlights: state.highlights }), 'hideHighlights');
      } else {
        set(
          state => ({ highlights: [...state.highlights, ...state.hiddenHighlights], hiddenHighlights: [] }),
          'showHighlights',
        );
      }
    },
    removeHighlight: (paperId: string, highlightId: string) => {
      axios
        .delete(`/paper/${paperId}/comment/${highlightId}`)
        .then(() => {
          set(state => ({ highlights: state.highlights.filter(h => h.id !== highlightId) }), 'removeHighlight');
        })
        .catch((err: any) => console.log(err.response));
    },
    updateHighlightText: (paperId: string, highlightId: string, newText: string) => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await axios.patch<{ comment: T_Highlight }>(`/paper/${paperId}/comment/${highlightId}`, {
            comment: newText,
          });
          updateHighlightHelper(res.data.comment);
          resolve(res.data.comment);
        } catch (e) {
          reject(e);
        }
      });
    },
    replyToHighlight: (paperId: string, highlightId: string, replyText: string) => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await axios.post(`/paper/${paperId}/comment/${highlightId}/reply`, {
            text: replyText,
          });
          updateHighlightHelper(res.data.comment);
          resolve(res.data.comment);
        } catch (e) {
          reject(e);
        }
      });
    },
    fetchPaper: async ({ paperId, selectedGroupId }: { paperId: string; selectedGroupId?: string }) => {
      const res = await axios.get<FetchPaperResponse>(`/paper/${paperId}`);
      const { data } = res;
      const newState: Partial<PaperState> = {
        isBookmarked: data.saved_in_library,
        codeMeta: data.code,
        groupIds: data.groups,
      };

      if (selectedGroupId) {
        newState.commentVisibilty = { type: 'group', id: selectedGroupId as string };
      }
      set(newState, 'setPaper');
      fetchComments(paperId);
      fetchReferences(paperId);
      fetchAcronyms(paperId);
      return res.data;
    },

    setSidebarJumpTo: (jumpData: SidebarCommentJump) => set({ sidebarJumpData: jumpData }, 'jumpToSidebar'),
    setPaperJumpTo: (jumpData: PaperJump) => set({ paperJumpData: jumpData }, 'jumpToPaper'),
    clearSidebarJumpTo: () => set({ sidebarJumpData: undefined }, 'clearSidebarJumpTo'),
    clearPaperJumpTo: () => set({ paperJumpData: undefined }, 'clearPaperJumpTo'),
    setCommentVisibilitySettings: (visibility: Visibility) =>
      set({ commentVisibilty: visibility }, 'commentVisibility'),
    setSidebarTab: (tab: SidebarTab) => set({ sidebarTab: tab }, 'sidebarTab'),
    setSections: (sections: Section[]) => set({ sections }, 'setSections'),
  };
};

export const [usePaperStore, paperStoreApi] = createWithDevtools(stateAndActions, 'Paper');
