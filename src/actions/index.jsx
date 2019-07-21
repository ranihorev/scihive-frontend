import { actions as categoriesActions } from './categories';

export const TOGGLE_LOGIN_MODAL = 'TOGGLE_LOGIN_MODAL';
export const TOGGLE_GROUPS_MODAL = 'TOGGLE_GROUPS_MODAL';
export const SET_USER = 'SET_USER';
export const READING_PROGRESS = 'READING_PROGRESS';
export const SET_BOOKMARK = 'SET_BOOKMARK';
export const SELECT_GROUP = 'SELECT_GROUP';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_DOCUMENT = 'SET_DOCUMENT';
export const SET_SECTIONS = 'SET_SECTIONS';
export const SET_REFERNCES = 'SET_REFERNCES';
export const CLEAR_PAPER = 'CLEAR_PAPER';
export const SET_HIGHLIGHTS = 'SET_HIGHLIGHTS';
export const ADD_HIGHLIGHT = 'ADD_HIGHLIGHT';
export const UPDATE_HIGHLIGHT = 'UPDATE_HIGHLIGHT';
export const REMOVE_HIGHLIGHT = 'REMOVE_HIGHLIGHT';
export const TOGGLE_HIGHLIGHTS = 'TOGGLE_HIGHLIGHTS';
export const SET_ACRONYMS = 'SET_ACRONYMS';
export const BLINK_LIBRARY = 'BLINK_LIBRARY';
export const SET_SIDEBAR_TAB = 'SET_SIDEBAR_TAB';
export const JUMP_TO = 'JUMP_TO';
export const CLEAR_JUMP_TO = 'CLEAR_JUMP_TO';
export const SET_CODE_META = 'SET_CODE_META';

export const actions = {
  toggleLoginModal: message => {
    return {
      type: TOGGLE_LOGIN_MODAL,
      payload: message,
    };
  },
  toggleGroupsModal: state => {
    return {
      type: TOGGLE_GROUPS_MODAL,
      payload: state,
    };
  },
  setUser: payload => {
    return {
      type: SET_USER,
      payload,
    };
  },
  updateReadingProgress: payload => {
    return {
      type: READING_PROGRESS,
      payload,
    };
  },
  setBookmark: payload => {
    return {
      type: SET_BOOKMARK,
      payload,
    };
  },
  setCodeMeta: payload => {
    return {
      type: SET_CODE_META,
      payload,
    };
  },
  setDocument: document => {
    return {
      type: SET_DOCUMENT,
      payload: document,
    };
  },
  selectGroup: payload => {
    return {
      type: SELECT_GROUP,
      payload,
    };
  },
  setGroups: payload => ({
    type: SET_GROUPS,
    payload,
  }),
  setSections: sections => ({
    type: SET_SECTIONS,
    payload: sections,
  }),
  setReferences: references => ({
    type: SET_REFERNCES,
    payload: references,
  }),
  clearPaper: () => ({
    type: CLEAR_PAPER,
  }),
  addHighlight: highlight => ({
    type: ADD_HIGHLIGHT,
    payload: highlight,
  }),
  setHighlights: highlights => ({
    type: SET_HIGHLIGHTS,
    payload: highlights,
  }),
  updateHighlight: highlight => ({
    type: UPDATE_HIGHLIGHT,
    payload: highlight,
  }),
  removeHighlight: highlightId => ({
    type: REMOVE_HIGHLIGHT,
    payload: highlightId,
  }),
  toggleHighlightsVisiblity: () => ({
    type: TOGGLE_HIGHLIGHTS,
  }),
  setAcronyms: acronyms => ({
    type: SET_ACRONYMS,
    payload: acronyms,
  }),
  blinkLibrary: () => ({
    type: BLINK_LIBRARY,
  }),
  setSidebarTab: tab => ({
    type: SET_SIDEBAR_TAB,
    payload: tab,
  }),
  jumpTo: location => ({
    type: JUMP_TO,
    payload: location,
  }),
  clearJumpTo: () => ({
    type: JUMP_TO,
  }),
  ...categoriesActions,
};
