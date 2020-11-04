import axios from 'axios';
import produce from 'immer';
import { isEmpty, omit, pick, sortBy } from 'lodash';
import { GetState } from 'zustand';
import {
  Acronyms,
  AllHighlight,
  AllNewHighlight,
  Author,
  BasePaperData,
  CodeMeta,
  EditHighlightData,
  FileMetadata,
  GeneralHighlight,
  isGeneralHighlight,
  PaperJump,
  References,
  TableOfContents,
  TempHighlight,
  T_Highlight,
  Visibility,
} from '../models';
import { CommentEvent } from '../paper/models';
import { track } from '../Tracker';
import { getSectionPosition } from '../utils';
import { AddRemovePaperToGroup, addRemovePaperToGroupHelper, createWithDevtools, NamedSetState } from './utils';

export interface PaperState extends BasePaperData {
  url?: string;
  isDocumentReady: boolean;
  acronyms: Acronyms;
  highlights: AllHighlight[];
  highlightsState: 'loading' | 'loaded';
  isEditable: boolean;
  groupIds: string[];
  hiddenHighlights: AllHighlight[];
  readingProgress: number;
  paperJumpData?: PaperJump;
  codeMeta?: CodeMeta;
  commentVisibility: Visibility;
  // new highlight data
  tempHighlight?: TempHighlight;
  isInviteOpen: boolean;
  metadataState: 'Fetching' | 'Ready';
  doi?: string;
}

const initialState: PaperState = {
  id: '',
  url: '',
  title: '',
  abstract: '',
  timePublished: '',
  authors: [],
  readingProgress: 0,
  highlightsState: 'loading',
  highlights: [],
  hiddenHighlights: [],
  acronyms: {},
  groupIds: [],
  commentVisibility: { type: 'public' },
  isEditable: false,
  isDocumentReady: false,
  isInviteOpen: false,
  metadataState: 'Fetching',
};

interface FetchPaperResponse {
  id: string;
  authors: Author[];
  timePublished?: string;
  abstract?: string;
  url: string;
  title: string;
  code?: CodeMeta;
  groups: string[];
  isEditable: boolean;
  metadataState: PaperState['metadataState'];
  doi?: string;
  tableOfContents?: TableOfContents;
  references?: References;
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
  const fetchComments = async (paperId: string, token?: string) => {
    try {
      const res = await axios.get<{ comments: AllHighlight[] }>(`/paper/${paperId}/comments`, { params: { token } });
      set({ highlights: sortHighlights(res.data.comments), highlightsState: 'loaded' });
    } catch (err) {
      console.warn(err.response);
    }
  };

  const updateHighlightsHelper = (state: PaperState, highlightToUpdate: T_Highlight): PaperState => {
    return produce(state, draftState => {
      const index = draftState.highlights.findIndex(h => h.id === highlightToUpdate.id);
      if (index > -1) {
        draftState.highlights[index] = highlightToUpdate;
      } else {
        draftState.highlights = sortHighlights([...draftState.highlights, highlightToUpdate]);
      }
    });
  };

  const removeHighlightHelper = (state: PaperState, highlightId: string): Partial<PaperState> => {
    return { highlights: state.highlights.filter(h => h.id !== highlightId) };
  };

  const resetState = () => {
    set(initialState, 'resetState');
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
    clearPaper: () => {
      set({ ...initialState, references: undefined }, 'clearPaper');
    },
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
      const response = await axios.post<{ comment: T_Highlight }>(`/paper/${paperId}/new_comment`, highlight);
      const newHighlight = response.data.comment;
      track(highlight.text ? 'newComment' : 'newHighlight');
      set(
        state => ({
          ...updateHighlightsHelper(state, newHighlight),
          ...(clearTempHighlight ? { tempHighlight: undefined } : {}),
        }),
        'addHighlight',
      );
      return newHighlight;
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
          set(state => removeHighlightHelper(state, highlightId), 'removeHighlight');
        })
        .catch((err: any) => console.warn(err.response));
    },
    updateHighlight: async (highlightId: string, data: EditHighlightData) => {
      const paperId = get().id;
      if (!paperId) throw Error('Paper id is missing');
      const res = await axios.patch<{ comment: T_Highlight }>(`/paper/comment/${highlightId}`, {
        text: data.text,
        visibility: data.visibility,
      });
      track('editHighlight');
      set(state => updateHighlightsHelper(state, res.data.comment), 'updateHighlight');
      return res.data.comment;
    },
    replyToHighlight: async (highlightId: string, replyText: string) => {
      const res = await axios.post(`/paper/comment/${highlightId}/reply`, {
        text: replyText,
      });
      track('newReply');
      set(state => updateHighlightsHelper(state, res.data.comment), 'updateHighlight');
      return res.data.comment;
    },
    fetchPaper: async ({ paperId, token }: { paperId: string; token?: string }) => {
      resetState();
      const { data } = await axios.get<FetchPaperResponse>(`/paper/${paperId}`, {
        withCredentials: true,
        params: { token },
      });
      paperId = data.id;
      const newState: Partial<PaperState> = {
        codeMeta: data.code,
        groupIds: data.groups,
        ...pick(data, [
          'id',
          'title',
          'abstract',
          'authors',
          'doi',
          'tableOfContents',
          'references',
          'timePublished',
          'metadataState',
          'isEditable',
          'url',
        ]),
      };

      set(newState, 'setPaper');
      fetchComments(paperId, token);
      return data;
    },
    updateMetadata: (metadata: BasePaperData) => {
      // TODO: consolidate with editPaper
      const paperId = get().id;
      if (metadata.id !== paperId) {
        console.error(`Paper ID does not match meta data ID`);
        return;
      }
      set({ ...omit(metadata, ['id']), metadataState: 'Ready' });
    },
    editPaper: async (data: FileMetadata) => {
      const paperId = get().id;
      if (!paperId) {
        console.warn('paper id is missing');
        return;
      }
      const { data: respData } = await axios.post<FetchPaperResponse>(`/paper/${paperId}/edit`, data);
      const newData: Partial<PaperState> = {
        ...pick(respData, ['title', 'abstract', 'authors', 'doi']),
        timePublished: respData.timePublished,
      };
      set(newData, 'editPaper');
    },
    setPaperJumpTo: ({ type, id }: { type: 'section' | 'highlight'; id: string }) => {
      let jumpData: PaperJump;
      if (type === 'section') {
        const sections = get().tableOfContents || [];
        const currentSection = sections[parseInt(id)];
        if (!currentSection) return;
        jumpData = {
          area: 'paper',
          type: 'section',
          id: id,
          location: getSectionPosition(currentSection),
        };
      } else {
        // type === 'highlight'
        const matchingComment = get().highlights.find(h => h.id === id);
        if (!matchingComment || isGeneralHighlight(matchingComment)) return;
        jumpData = {
          id: matchingComment.id,
          area: 'paper',
          type: 'highlight',
          location: matchingComment.position,
        };
      }
      set({ paperJumpData: jumpData }, 'jumpToPaper');
    },
    clearPaperJumpTo: () => set({ paperJumpData: undefined }, 'clearPaperJumpTo'),
    setCommentVisibilitySettings: (visibility: Visibility) =>
      set({ commentVisibility: visibility }, 'commentVisibility'),
    setTempHighlight: (highlight: TempHighlight) => set({ tempHighlight: highlight }),
    clearTempHighlight: () => set({ tempHighlight: undefined }),
    setDocumentReady: () => set({ isDocumentReady: true }),
    setIsInviteOpen: (isInviteOpen: boolean) => set({ isInviteOpen }),
    onCommentEvent: (event: CommentEvent) => {
      if (event.type === 'new' || event.type === 'update') {
        set(state => updateHighlightsHelper(state, event.data));
      } else if (event.type === 'delete') {
        set(state => removeHighlightHelper(state, event.id));
      }
    },
  };
};

export const [usePaperStore, paperStoreApi] = createWithDevtools(stateAndActions, 'Paper');
