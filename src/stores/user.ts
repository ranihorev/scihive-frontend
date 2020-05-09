import * as Sentry from '@sentry/browser';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GetState } from 'zustand';
import { Group, User } from '../models';
import { notifyOnNewGroup } from '../notifications/newGroup';
import { track } from '../Tracker';
import { GroupColor } from '../utils/presets';
import { createWithDevtools, NamedSetState } from './utils';

interface UserState {
  isLoginModalOpen: boolean;
  userData?: User;
  loginModalMessage?: string;
  groups: Group[];
  inviteGroup?: Group;
}

const initialState: UserState = {
  isLoginModalOpen: false,
  groups: [],
};

const stateAndActions = (set: NamedSetState<UserState>, get: GetState<UserState>) => {
  const updateGroups = (groups: Group[], actionName?: string) => set(state => ({ groups }), actionName);
  return {
    ...initialState,
    setUser: (user: User) => set(state => ({ userData: user }), 'setUser'),
    loadGroups: async (groupId: string | undefined, onSuccess: () => void) => {
      if (get().userData) {
        const res = await axios.get('/groups/all');
        updateGroups(res.data, 'loadGroups');
      }
      const groups = get().groups;
      if (!groupId) return;
      let group = groups.find(g => g.id === groupId);
      if (!group) {
        const res = await axios.get(`/groups/group/${groupId}`);
        group = res.data;
        if (!group) {
          console.warn('Group not found');
          return;
        }
        set(state => ({ inviteGroup: group }));
        notifyOnNewGroup(group, () => {
          track('joinGroup');
          axios.post('/groups/all', { id: groupId }).then(res => {
            updateGroups(res.data, 'loadGroups');
            onSuccess();
          });
        });
      }
    },
    editGroup: async (id: string, payload: { name?: string; color?: GroupColor }) => {
      track('editGroup');
      return axios
        .patch(`/groups/group/${id}`, payload)
        .then(res => {
          updateGroups(res.data, 'editGroup');
        })
        .catch(e => console.warn(e.message));
    },
    newGroup: async ({ name, color }: { name: string; color?: GroupColor }) => {
      track('newGroup');
      try {
        const res = await axios.post<{ groups: Group[]; new_id: string }>('/groups/new', { name, color });
        updateGroups(res.data.groups, 'newGroup');
        return res.data;
      } catch (e) {
        toast.error('Failed to create a new group :(');
        Sentry.captureException(e);
        return undefined;
      }
    },
    deleteGroup: (id: string) => {
      axios
        .delete(`/groups/group/${id}`)
        .then(res => {
          updateGroups(res.data, 'deleteGroup');
        })
        .catch(e => console.warn(e.message));
    },
    toggleLoginModal: (message?: string) =>
      set(state => ({ isLoginModalOpen: !state.isLoginModalOpen, loginModalMessage: message }), 'toggleLoginModal'),
  };
};

export const [useUserStore, userStoreApi] = createWithDevtools(stateAndActions, 'User');
