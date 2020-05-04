import axios from 'axios';
import produce from 'immer';
import { isEmpty, pick, sortBy } from 'lodash';
import { GetState } from 'zustand';
import {
  Acronyms,
  AllHighlight,
  AllNewHighlight,
  CodeMeta,
  EditHighlightData,
  FileMetadata,
  GeneralHighlight,
  isGeneralHighlight,
  PaperJump,
  References,
  Section,
  SidebarCommentJump,
  SidebarTab,
  TempHighlight,
  T_Highlight,
  Visibility,
  BasePaperData,
} from '../models';
import { track } from '../Tracker';
import { AddRemovePaperToGroup, addRemovePaperToGroupHelper, createWithDevtools, NamedSetState } from './utils';

export interface PaperState extends BasePaperData {
  url?: string;
  sections?: Section[];
  references: References;
  acronyms: Acronyms;
  highlights: AllHighlight[];
  isEditable: boolean;
  groupIds: string[];
  hiddenHighlights: AllHighlight[];
  readingProgress: number;
  sidebarTab: SidebarTab;
  sidebarJumpData?: SidebarCommentJump;
  paperJumpData?: PaperJump;
  codeMeta?: CodeMeta;
  commentVisibility: Visibility;
  // new highlight data
  tempHighlight?: TempHighlight;
}

const initialState: PaperState = {
  id: '',
  url: '',
  title: '',
  abstract: '',
  time_published: '',
  authors: [],
  readingProgress: 0,
  references: {},
  highlights: [],
  hiddenHighlights: [],
  acronyms: {},
  sidebarTab: 'Sections',
  groupIds: [],
  commentVisibility: { type: 'public' },
  isEditable: false,
};

interface FetchPaperResponse {
  authors: { name: string }[];
  time_published?: string;
  abstract?: string;
  url: string;
  title: string;
  code?: CodeMeta;
  groups: string[];
  is_editable: boolean;
}

const sortHighlights = (highlights: AllHighlight[]): AllHighlight[] => {
  const general: GeneralHighlight[] = [];
  let rest: T_Highlight[] = [];
  for (const highlight of highlights) {
    if (isGeneralHighlight(highlight)) {
      general.push(highlight);
    } else {
      rest.push(highlight);
    }
  }
  rest = sortBy(rest, ['position.pageNumber', 'position.boundingRect.y1']);
  return [...general, ...rest];
};

const stateAndActions = (set: NamedSetState<PaperState>, get: GetState<PaperState>) => {
  const fetchComments = async (paperId: string) => {
    try {
      const res = await axios.get<{ comments: AllHighlight[] }>(`/paper/${paperId}/comments`);
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
      state => ({
        highlights: state.highlights.map(h => (h.id === newHighlight.id ? newHighlight : h)),
      }),
      'updateHighlight',
    );
  };

  return {
    ...initialState,
    updatePaperGroups: (payload: AddRemovePaperToGroup) => {
      try {
        addRemovePaperToGroupHelper(payload);
      } catch (e) {
        console.warn(e);
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
    clearPaper: () => set(initialState, 'clearPaper'),
    updateReadingProgress: (progress: number) => set({ readingProgress: progress }),
    setPaperData: (data: Partial<PaperState>) => set(data, 'setPaperData'),
    toggleHighlightsVisibility: () => {
      if (isEmpty(get().hiddenHighlights)) {
        set(state => ({ highlights: [], hiddenHighlights: state.highlights }), 'hideHighlights');
      } else {
        set(
          state => ({ highlights: [...state.highlights, ...state.hiddenHighlights], hiddenHighlights: [] }),
          'showHighlights',
        );
      }
    },
    addHighlight: async (paperId: string, highlight: AllNewHighlight, clearTempHighlight: boolean = true) => {
      return new Promise<T_Highlight>(async (resolve, reject) => {
        try {
          const response = await axios.post<{ comment: T_Highlight }>(`/paper/${paperId}/new_comment`, highlight);
          const newHighlight = response.data.comment;
          track(highlight.text ? 'newComment' : 'newHighlight');
          set(
            state => ({
              highlights: sortHighlights([...state.highlights, newHighlight]),
              sidebarTab: 'Comments',
              ...(clearTempHighlight ? { tempHighlight: undefined } : {}),
            }),
            'addHighlight',
          );
          resolve(newHighlight);
        } catch (e) {
          reject(e);
        }
      });
    },
    removeHighlight: (highlightId: string) => {
      const paperId = get().id;
      if (!paperId) {
        console.warn('Paper id is missing');
        return;
      }
      axios
        .delete(`/paper/comment/${highlightId}`)
        .then(() => {
          set(state => ({ highlights: state.highlights.filter(h => h.id !== highlightId) }), 'removeHighlight');
        })
        .catch((err: any) => console.warn(err.response));
    },
    updateHighlight: (highlightId: string, data: EditHighlightData) => {
      return new Promise(async (resolve, reject) => {
        try {
          const paperId = get().id;
          if (!paperId) reject('Paper id is missing');
          const res = await axios.patch<{ comment: T_Highlight }>(`/paper/comment/${highlightId}`, {
            text: data.text,
            visibility: data.visibility,
          });
          track('editHighlight');
          updateHighlightHelper(res.data.comment);
          resolve(res.data.comment);
        } catch (e) {
          reject(e);
        }
      });
    },
    replyToHighlight: (highlightId: string, replyText: string) => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await axios.post(`/paper/comment/${highlightId}/reply`, {
            text: replyText,
          });
          track('newReply');
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
        codeMeta: data.code,
        groupIds: data.groups,
        isEditable: data.is_editable,
        id: paperId,
        ...pick(data, ['id', 'time_published', 'title', 'abstract', 'authors']),
      };

      if (selectedGroupId) {
        newState.commentVisibility = { type: 'group', id: selectedGroupId as string };
      }
      set(newState, 'setPaper');
      fetchComments(paperId);
      fetchReferences(paperId);
      // TODO: add this back once backend is fixed
      // fetchAcronyms(paperId);
      return data;
    },
    editPaper: async (data: FileMetadata) => {
      const paperId = get().id;
      if (!paperId) {
        console.warn('paper id is missing');
        return;
      }
      const { data: respData } = await axios.post<FetchPaperResponse>(`/paper/${paperId}/edit`, data);
      const newData = pick(respData, ['time_published', 'title', 'abstract', 'authors']);
      set(newData, 'editPaper');
    },
    setSidebarJumpTo: (jumpData: SidebarCommentJump) => set({ sidebarJumpData: jumpData }, 'jumpToSidebar'),
    setPaperJumpTo: (jumpData: PaperJump) => set({ paperJumpData: jumpData }, 'jumpToPaper'),
    clearSidebarJumpTo: () => set({ sidebarJumpData: undefined }, 'clearSidebarJumpTo'),
    clearPaperJumpTo: () => set({ paperJumpData: undefined }, 'clearPaperJumpTo'),
    setCommentVisibilitySettings: (visibility: Visibility) =>
      set({ commentVisibility: visibility }, 'commentVisibility'),
    setSidebarTab: (tab: SidebarTab) => set({ sidebarTab: tab }, 'sidebarTab'),
    setSections: (sections: Section[]) => set({ sections }, 'setSections'),
    setTempHighlight: (highlight: TempHighlight) => set({ tempHighlight: highlight }),
    clearTempHighlight: () => set({ tempHighlight: undefined }),
  };
};

export const [usePaperStore, paperStoreApi] = createWithDevtools(stateAndActions, 'Paper');
