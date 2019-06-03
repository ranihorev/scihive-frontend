import { SELECT_GROUP, SET_USER, TOGGLE_GROUPS_MODAL, TOGGLE_LOGIN_MODAL, SET_GROUPS, BLINK_LIBRARY } from '../actions';

const initialState = {
  isLoginModalOpen: false,
  isGroupsModalOpen: false,
  userData: null,
  loginModalMessage: null,
  groups: undefined,
  selectedGroup: undefined,
  blinkLibraryState: false,
};

export default function dataReducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_LOGIN_MODAL:
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen, loginModalMessage: action.payload };
    case TOGGLE_GROUPS_MODAL:
      return { ...state, isGroupsModalOpen: action.payload !== undefined ? action.payload : !state.isGroupsModalOpen };
    case SET_USER:
      return { ...state, userData: action.payload };
    case SELECT_GROUP:
      return { ...state, selectedGroup: action.payload };
    case SET_GROUPS:
      return { ...state, groups: action.payload };
    case BLINK_LIBRARY:
      return { ...state, blinkLibraryState: !state.blinkLibraryState };
    default:
      return state;
  }
}
