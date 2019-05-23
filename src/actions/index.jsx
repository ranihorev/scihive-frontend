export const TOGGLE_LOGIN_MODAL = 'toggle_login_modal';
export const TOGGLE_GROUPS_MODAL = 'toggle_groups_modal';
export const SET_USER = 'set_user';
export const READING_PROGRESS = 'read_progress';
export const SET_BOOKMARK = 'toggle_bookmark';
export const SELECT_GROUP = 'select_group';
export const SET_GROUPS = 'set_groups';
export const SET_DOCUMENT = 'set_document';
export const SET_SECTIONS = 'set_sections';
export const SET_REFERNCES = 'set_references';
export const CLEAR_PAPER = 'clear_paper';

export const actions = {
  toggleLoginModal: message => {
    return {
      type: TOGGLE_LOGIN_MODAL,
      payload: message
    };
  },
  toggleGroupsModal: state => {
    return {
      type: TOGGLE_GROUPS_MODAL,
      payload: state
    };
  },
  setUser: payload => {
    return {
      type: SET_USER,
      payload
    };
  },
  updateReadingProgress: payload => {
    return {
      type: READING_PROGRESS,
      payload
    };
  },
  setBookmark: payload => {
    return {
      type: SET_BOOKMARK,
      payload
    };
  },
  setDocument: document => {
    return {
      type: SET_DOCUMENT,
      payload: document
    };
  },
  selectGroup: payload => {
    return {
      type: SELECT_GROUP,
      payload
    };
  },
  setGroups: payload => ({
    type: SET_GROUPS,
    payload
  }),
  setSections: sections => ({
    type: SET_SECTIONS,
    payload: sections
  }),
  setReferences: references => ({
    type: SET_REFERNCES,
    payload: references
  }),
  clearPaper: () => {
    return {
      type: CLEAR_PAPER
    };
  }
};
