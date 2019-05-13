export const TOGGLE_LOGIN_MODAL = 'toggle_login_modal';
export const TOGGLE_GROUPS_MODAL = 'toggle_groups_modal';
export const SET_USER = 'set_user';
export const READING_PROGRESS = 'read_progress';
export const SET_BOOKMARK = 'toggle_bookmark';
export const SELECT_GROUP = 'select_group';
export const SET_GROUPS = 'set_groups';

export const actions = {
  toggleLoginModal: (message) => {
    return {
      type: TOGGLE_LOGIN_MODAL,
      payload: message
    }
  },
  toggleGroupsModal: (state) => {
    return {
      type: TOGGLE_GROUPS_MODAL,
      payload: state
    }
  },
  setUser: (payload) => {
    return {
      type: SET_USER,
      payload
    }
  },
  updateReadingProgress: (payload) => {
    return {
      type: READING_PROGRESS,
      payload
    }
  },
  setBookmark: (payload) => {
    return {
      type: SET_BOOKMARK,
      payload
    }
  },
  selectGroup: (payload) => {
    return {
      type: SELECT_GROUP,
      payload,
    }
  },
  setGroups: (payload) => {
    return {
      type: SET_GROUPS,
      payload,
    }
  }
};
