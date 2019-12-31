import { produce } from 'immer';
import { isEmpty } from 'lodash';
import { PaperAction, PaperActionKeys, PaperActions } from '../actions/paper';
import { RootState, T_Highlight } from '../models';

type PaperState = RootState['paper'];

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

const updateHighlight = (state: PaperState, newHighlight: T_Highlight) => {
  const highlights = state.highlights.map(h => (h.id === newHighlight.id ? newHighlight : h));
  return {
    ...state,
    highlights,
  };
};

const reducerHelper: {
  [K in PaperActionKeys]: (state: PaperState, action: PaperAction<K>) => PaperState;
} = {
  clearPaper: () => initialState,
  updateReadingProgress: (state, action) => ({ ...state, readingProgress: action.payload }),
  setBookmark: (state, action) => ({ ...state, isBookmarked: action.payload }),
  setCodeMeta: (state, action) => ({ ...state, codeMeta: action.payload }),
  setDocument: (state, action) => ({ ...state, document: action.payload }),
  setSections: (state, action) => ({ ...state, sections: action.payload }),
  setReferences: (state, action) => ({ ...state, references: action.payload }),
  setHighlights: (state, action) => ({ ...state, highlights: action.payload }),
  addHighlight: (state, action) => ({ ...state, highlights: [action.payload, ...state.highlights] }),
  updateHighlight: (state, action) => updateHighlight(state, action.payload),
  removeHighlight: (state, action) => ({
    ...state,
    highlights: state.highlights.filter(h => h.id !== action.payload),
  }),
  toggleHighlightsVisiblity: (state, action) => {
    if (isEmpty(state.hiddenHighlights)) {
      return {
        ...state,
        highlights: [],
        hiddenHighlights: state.highlights,
      };
    }
    return {
      ...state,
      highlights: [...state.highlights, ...state.hiddenHighlights],
      hiddenHighlights: [],
    };
  },
  setAcronyms: (state, action) => ({ ...state, acronyms: action.payload }),
  setSidebarTab: (state, action) => ({ ...state, sidebarTab: action.payload }),
  jumpTo: (state, action) => ({ ...state, jumpData: action.payload }),
  clearJumpTo: (state, action) => ({ ...state, jumpData: undefined }),
  addRemoveGroupIds: (state, action) => {
    // TODO: refactor this code and combine with the list view
    const { groupIds, shouldAdd } = action.payload;
    return produce(state, draftState => {
      if (shouldAdd) {
        draftState.groupIds = [...draftState.groupIds, ...groupIds];
      } else {
        draftState.groupIds = draftState.groupIds.filter(g => !groupIds.includes(g));
      }
      return draftState;
    });
  },
  setCommentVisibilitySettings: (state, action) => ({ ...state, commentVisibilty: { ...action.payload } }),
};

const dataReducer = (state: PaperState = initialState, action: PaperActions) => {
  const reducer = reducerHelper[action.type];
  if (reducer) {
    return reducer(state, action as any);
  }
  return state;
};

export default dataReducer;
