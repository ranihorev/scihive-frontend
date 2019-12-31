import { RootState } from '../models';
import { Action } from '../actions';

type UserState = RootState['user'];

const initialState: UserState = {
  isLoginModalOpen: false,
  isGroupsModalOpen: false,
  groups: [],
};

export default function dataReducer(state: UserState = initialState, action: Action): UserState {
  switch (action.type) {
    case 'toggleLoginModal':
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen, loginModalMessage: action.payload };
    case 'toggleGroupsModal':
      return { ...state, isGroupsModalOpen: action.payload !== undefined ? action.payload : !state.isGroupsModalOpen };
    case 'setUser':
      return { ...state, userData: action.payload };
    case 'setGroups':
      return { ...state, groups: action.payload };
    case 'updateGroups':
      return { ...state, groups: action.payload };
    default:
      return state;
  }
}
