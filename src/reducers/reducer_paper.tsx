import { isEmpty } from 'lodash';
import { RootState, T_Highlight } from '../models';
import { Action } from '../actions';

type PaperState = RootState['paper'];

const initialState: PaperState = {
  readingProgress: 0,
  isBookmarked: false,
  references: {},
  highlights: [],
  hiddenHighlights: [],
  acronyms: {},
  sidebarTab: 'Sections',
  jumpData: {},
};

const updateHighlight = (state: PaperState, newHighlight: T_Highlight) => {
  const highlights = state.highlights.map(h => (h.id === newHighlight.id ? newHighlight : h));
  return {
    ...state,
    highlights,
  };
};

const dataReducer = (state: PaperState = initialState, action: Action) => {
  switch (action.type) {
    case 'CLEAR_PAPER':
      return initialState;
    case 'READING_PROGRESS':
      return { ...state, readingProgress: action.payload };
    case 'SET_BOOKMARK':
      return { ...state, isBookmarked: action.payload };
    case 'SET_CODE_META':
      return { ...state, codeMeta: action.payload };
    case 'SET_DOCUMENT':
      return { ...state, document: action.payload };
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_REFERNCES':
      return { ...state, references: action.payload };
    case 'SET_HIGHLIGHTS':
      return { ...state, highlights: action.payload };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [action.payload, ...state.highlights] };
    case 'UPDATE_HIGHLIGHT':
      return updateHighlight(state, action.payload);
    case 'REMOVE_HIGHLIGHT':
      return {
        ...state,
        highlights: state.highlights.filter(h => h.id !== action.payload),
      };
    case 'TOGGLE_HIGHLIGHTS':
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
    case 'SET_ACRONYMS':
      return { ...state, acronyms: action.payload };
    case 'SET_SIDEBAR_TAB':
      return { ...state, sidebarTab: action.payload };
    case 'JUMP_TO':
      return { ...state, jumpData: action.payload };
    default:
      return state;
  }
};

export default dataReducer;
