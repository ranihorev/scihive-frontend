import { Group, User } from '../models';

export const actions = {
  toggleLoginModal: (message?: string) => {
    return {
      type: 'toggleLoginModal' as const,
      payload: message,
    };
  },
  toggleGroupsModal: (state?: boolean) => {
    return {
      type: 'toggleGroupsModal' as const,
      payload: state,
    };
  },
  setUser: (payload: User) => {
    return {
      type: 'setUser' as const,
      payload,
    };
  },
  setGroups: (payload: Group[]) => ({
    type: 'setGroups' as const,
    payload,
  }),
  updateGroups: (payload: Group[]) => ({
    type: 'updateGroups' as const,
    payload,
  }),
};
