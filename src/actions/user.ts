import { Group } from '../models';

export const actions = {
  toggleLoginModal: (message: string) => {
    return {
      type: 'TOGGLE_LOGIN_MODAL' as const,
      payload: message,
    };
  },
  toggleGroupsModal: (state: boolean) => {
    return {
      type: 'TOGGLE_GROUPS_MODAL' as const,
      payload: state,
    };
  },
  setUser: (payload: { username: string }) => {
    return {
      type: 'SET_USER' as const,
      payload,
    };
  },
  selectGroup: (payload: Group) => {
    return {
      type: 'SELECT_GROUP' as const,
      payload,
    };
  },
  setGroups: (payload: Group[]) => ({
    type: 'SET_GROUPS' as const,
    payload,
  }),
  blinkLibrary: () => ({
    type: 'BLINK_LIBRARY' as const,
    payload: {},
  }),
};
