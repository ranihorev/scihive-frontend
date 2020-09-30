import axios from 'axios';
import { omit } from 'lodash';
import { GoogleLoginResponse } from 'react-google-login';
import { GetState } from 'zustand';
import { createWithDevtools, NamedSetState } from './utils';

export type AccountProvider = 'Password' | 'Google';

export interface UserProfile {
  googleData?: {
    token: string;
    googleId: string;
    imageUrl?: string;
  };
  provider: AccountProvider;
  username?: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
}

interface UserState {
  status: 'loggingIn' | 'loggedIn' | 'notAuthenticated';
  profile?: UserProfile;
  contactsPermission: boolean;
  loginModal: {
    isOpen: boolean;
    message?: string;
  };
}

const initialState: UserState = {
  status: 'loggingIn',
  contactsPermission: false,
  loginModal: {
    isOpen: false,
  },
};

export type ProfileResponse = Omit<UserProfile, 'googleData' | 'fullName'>;

const stateAndActions = (set: NamedSetState<UserState>, get: GetState<UserState>) => {
  return {
    ...initialState,
    setStatus: (isLoggedIn: UserState['status']) => set({ status: isLoggedIn }),
    setProfile: (profile: ProfileResponse) => {
      set({
        profile: {
          ...profile,
          fullName: profile.firstName
            ? `${profile.firstName} ${profile.lastName || ''}`
            : profile.username || 'Unknown',
        },
        status: 'loggedIn',
      });
    },
    setContactsPermission: (contactsPermission: boolean) => set({ contactsPermission }),
    onGoogleLogicSuccess: async ({ tokenId, profileObj }: GoogleLoginResponse) => {
      await axios.post('/user/google_login', { token: tokenId });
      set({
        profile: {
          email: profileObj.email,
          fullName: profileObj.name,
          firstName: profileObj.givenName,
          lastName: profileObj.familyName,
          provider: 'Google',
          googleData: { token: tokenId, googleId: profileObj.googleId, imageUrl: profileObj.imageUrl },
        },
        status: 'loggedIn',
      });
    },
    onLogout: async () => {
      set(state => ({ status: 'notAuthenticated', ...omit(state, ['profile', 'status']) }));
      axios.post('/user/logout');
    },
    toggleLoginModal: (message?: string) => {
      set(state => ({ loginModal: { isOpen: !state.loginModal.isOpen, message } }), 'toggleLoginModal');
    },
  };
};

export const [useUserStore, userStoreApi] = createWithDevtools(stateAndActions, 'UserNew');
