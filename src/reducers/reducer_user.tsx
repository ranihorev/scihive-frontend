import { RootState } from '../models';
import { Action } from '../actions';

type UserState = RootState['user'];

const initialState: UserState = {
  isLoginModalOpen: false,
  isGroupsModalOpen: false,
  blinkLibraryState: false,
};

export default function dataReducer(state: UserState = initialState, action: Action): UserState {
  switch (action.type) {
    case 'TOGGLE_LOGIN_MODAL':
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen, loginModalMessage: action.payload };
    case 'TOGGLE_GROUPS_MODAL':
      return { ...state, isGroupsModalOpen: action.payload !== undefined ? action.payload : !state.isGroupsModalOpen };
    case 'SET_USER':
      return { ...state, userData: action.payload };
    case 'SELECT_GROUP':
      return { ...state, selectedGroup: action.payload };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'BLINK_LIBRARY':
      return { ...state, blinkLibraryState: !state.blinkLibraryState };
    default:
      return state;
  }
}
