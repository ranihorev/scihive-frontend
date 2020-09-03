import { GetState } from 'zustand';
import { createWithDevtools, NamedSetState } from './utils';
import { GoogleLoginResponse } from 'react-google-login';
import Axios from 'axios';
import { omit } from 'lodash';

interface UserState {
  status: 'loggingIn' | 'loggedIn' | 'notAuthenticated';
  profile?: {
    token: string;
    googleId: string;
    imageUrl: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
  };
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
    setProfile: (profile: UserState['profile']) => set({ profile, status: 'loggedIn' }),
    setContactsPermission: (contactsPermission: boolean) => set({ contactsPermission }),
    onGoogleLogicSuccess: async (res: GoogleLoginResponse) => {
      await Axios.post('/user/google_login', { token: res.tokenId });
      set({ profile: { ...res.profileObj, token: res.tokenId }, status: 'loggedIn' });
    },
    onLogout: () => {
      set(state => ({ status: 'notAuthenticated', ...omit(state, ['profile', 'status']) }));
    },
  };
};

export const [useUserNewStore, userStoreNewApi] = createWithDevtools(stateAndActions, 'UserNew');
