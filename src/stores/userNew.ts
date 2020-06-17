import { GetState } from 'zustand';
import { createWithDevtools, NamedSetState } from './utils';

interface UserState {
  status: 'loggingIn' | 'loggedIn' | 'notAuthenticated';
  contactsPermission: boolean;
}

const initialState: UserState = {
  status: 'loggingIn',
  contactsPermission: false,
};

const stateAndActions = (set: NamedSetState<UserState>, get: GetState<UserState>) => {
  return {
    ...initialState,
    setStatus: (isLoggedIn: UserState['status']) => set({ status: isLoggedIn }),
    setContactsPermission: (contactsPermission: boolean) => set({ contactsPermission }),
  };
};

export const [useUserNewStore, userStoreNewApi] = createWithDevtools(stateAndActions, 'UserNew');
