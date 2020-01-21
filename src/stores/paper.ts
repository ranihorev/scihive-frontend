import axios from 'axios';
import produce from 'immer';
import { isEmpty, sortBy, pick } from 'lodash';
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
  T_NewHighlight,
  TempHighlight,
  TooltipData,
  FileMetadata,
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
  paperId?: string;
  title?: string;
  url?: string;
  authors: { name: string }[];
  date?: string;
  summary?: string;
  isBookmarked: boolean;
  sections?: Section[];
  references: References;
  acronyms: Acronyms;
  highlights: T_Highlight[];
  isEditable: boolean;
  groupIds: string[];
  hiddenHighlights: T_Highlight[];
  readingProgress: number;
  sidebarTab: SidebarTab;
  sidebarJumpData?: SidebarCommentJump;
  paperJumpData?: PaperJump;
  codeMeta?: CodeMeta;
  commentVisibilty: Visibility;
  // new highlight data
  tempHighlight?: TempHighlight;
  tempTooltipData?: TooltipData;
}

const initialState: PaperState = {
  authors: [],
  readingProgress: 0,
  isBookmarked: false,
  references: {},
  highlights: [],
  hiddenHighlights: [],
  acronyms: {},
  sidebarTab: 'Sections',
  groupIds: [],
  commentVisibilty: { type: 'public' },
  isEditable: false,
};

interface FetchPaperResponse {
  authors: { name: string }[];
  time_published?: string;
  summary?: string;
  url: string;
  saved_in_library: boolean;
  title: string;
  code?: CodeMeta;
  groups: string[];
  is_editable: boolean;
}

const sortHighlights = (highlights: T_Highlight[]) => {
  return sortBy(highlights, ['position.pageNumber', 'position.boundingRect.y1']);
};

const stateAndActions = (set: NamedSetState<PaperState>, get: GetState<PaperState>) => {
  const refactorPaperResponse = (data: FetchPaperResponse): Partial<PaperState> => {
    return {
      date: data.time_published,
      ...pick(data, ['title', 'summary', 'authors']),
    };
  };
  const fetchComments = async (paperId: string) => {
    try {
      const res = await axios.get(`/paper/${paperId}/comments`);
      set({ highlights: sortHighlights(res.data.comments) });
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
  const clearTempHighlightDataHelper = () => set({ tempHighlight: undefined, tempTooltipData: undefined });

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
    setPaperData: (data: Partial<PaperState>) => set(data, 'setPaperData'),
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
    addHighlight: async (paperId: string, highlight: T_NewHighlight) => {
      try {
        const res = await axios.post(`/paper/${paperId}/new_comment`, highlight);
        set(state => ({ highlights: sortHighlights([...state.highlights, res.data.comment]) }), 'addHighlight');
        clearTempHighlightDataHelper();
      } catch (e) {
        console.log(e.response);
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
      const { data } = await axios.get<FetchPaperResponse>(`/paper/${paperId}`);
      const newState: Partial<PaperState> = {
        url: data.url,
        isBookmarked: data.saved_in_library,
        codeMeta: data.code,
        groupIds: data.groups,
        isEditable: data.is_editable,
        paperId,
        ...refactorPaperResponse(data),
      };

      if (selectedGroupId) {
        newState.commentVisibilty = { type: 'group', id: selectedGroupId as string };
      }
      set(newState, 'setPaper');
      fetchComments(paperId);
      fetchReferences(paperId);
      fetchAcronyms(paperId);
      return data;
    },
    editPaper: async (data: FileMetadata) => {
      const paperId = get().paperId;
      if (!paperId) {
        console.warn('paper id is missing');
        return;
      }
      const { data: respData } = await axios.post<FetchPaperResponse>(`/paper/${paperId}/edit`, data);
      const newData = pick(refactorPaperResponse(respData), ['title', 'authors', 'date', 'summary']);
      set(newData, 'editPaper');
    },
    setSidebarJumpTo: (jumpData: SidebarCommentJump) => set({ sidebarJumpData: jumpData }, 'jumpToSidebar'),
    setPaperJumpTo: (jumpData: PaperJump) => set({ paperJumpData: jumpData }, 'jumpToPaper'),
    clearSidebarJumpTo: () => set({ sidebarJumpData: undefined }, 'clearSidebarJumpTo'),
    clearPaperJumpTo: () => set({ paperJumpData: undefined }, 'clearPaperJumpTo'),
    setCommentVisibilitySettings: (visibility: Visibility) =>
      set({ commentVisibilty: visibility }, 'commentVisibility'),
    setSidebarTab: (tab: SidebarTab) => set({ sidebarTab: tab }, 'sidebarTab'),
    setSections: (sections: Section[]) => set({ sections }, 'setSections'),
    setTooltipData: (data: TooltipData) => set({ tempTooltipData: data }),
    setTempHighlight: (highlight: TempHighlight) => set({ tempHighlight: highlight }),
    clearTempHighlightAndTooltip: clearTempHighlightDataHelper,
  };
};

export const [usePaperStore, paperStoreApi] = createWithDevtools(stateAndActions, 'Paper');