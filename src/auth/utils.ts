import { pick } from 'lodash';
import React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline, useGoogleLogin, useGoogleLogout } from 'react-google-login';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';
import { useUserNewStore, AccountProvider, UserProfile } from '../stores/userNew';
import { useLatestCallback } from '../utils/useLatestCallback';
import { toast } from 'react-toastify';
import axios from 'axios';

export const contactsScope = 'https://www.googleapis.com/auth/contacts.readonly';

export const isOnlineResponse = (res: GoogleLoginResponse | GoogleLoginResponseOffline): res is GoogleLoginResponse => {
  return 'tokenId' in res && 'profileObj' in res;
};

const STORAGE_KEY = 'loginProvider';

const storeUserLocally = (provider: AccountProvider) => {
  localStorage.setItem(STORAGE_KEY, provider);
};

type ProfileResponse = Omit<UserProfile, 'googleData' | 'fullName'>;

// Deprecated - we now use the auth server cookie instead
export const useIsLogedInViaGoogle = () => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const loginProvider = localStorage.getItem(STORAGE_KEY);
  const isGoogleLogin = loginProvider === 'Google';
  const { setStatus, status, onGoogleLogicSuccess } = useUserNewStore(
    state => pick(state, ['setStatus', 'status', 'onGoogleLogicSuccess']),
    shallow,
  );
  useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_ID,
    onAutoLoadFinished: isIn => {
      if (!isIn) {
        setStatus('notAuthenticated');
      }
    },
    onSuccess: async res => {
      if (isOnlineResponse(res)) {
        onGoogleLogicSuccess(res);
        storeUserLocally('Google');
      }
    },
    onFailure: e => {
      setStatus('notAuthenticated');
    },
    isSignedIn: isGoogleLogin,
    scope: `profile email ${contactsScope}`,
  });
  return status;
};

export const useIsLoggedIn = () => {
  const { setStatus, status, setProfile } = useUserNewStore(
    state => pick(state, ['setStatus', 'status', 'setProfile']),
    shallow,
  );
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  React.useEffect(() => {
    if (status !== 'loggingIn') return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setStatus('notAuthenticated');
    }
    axios.get<ProfileResponse | null>('/user/validate').then(response => {
      const profile = response.data;
      if (profile) {
        setProfile({
          ...profile,
          fullName: profile.firstName
            ? `${profile.firstName} ${profile.lastName || ''}`
            : profile.username || 'Unknown',
        });
      } else {
        setStatus('notAuthenticated');
      }
    });
  }, [setProfile, setStatus, status]);

  return status;
};

export const useHasContactsPermission = () => {
  const shownError = React.useRef(false);
  const { status, contactsPermission, setContactsPermission } = useUserNewStore(
    state => pick(state, ['status', 'contactsPermission', 'setContactsPermission']),
    shallow,
  );
  if (status !== 'loggedIn') return false;
  if (contactsPermission) return true; // We assume that the permissions won't be removed after approval
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const currentUser = authInstance.currentUser.get();
    const scopes = currentUser.getGrantedScopes();
    const contactsInScope = scopes.indexOf(contactsScope) >= 0;
    if (contactsPermission !== contactsInScope) {
      setContactsPermission(contactsInScope);
    }
    shownError.current = false;
    return contactsInScope;
  } catch (e) {
    if (!shownError.current) {
      toast.error('Failed to connect to Google services');
      shownError.current = true;
    }
  }
  return false;
};

export const useLogout = (goToPath: string) => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const history = useHistory();
  const storeLogout = useUserNewStore(state => state.onLogout);
  const { signOut: googleLogOut } = useGoogleLogout({ clientId: process.env.REACT_APP_GOOGLE_ID });
  const logOut = useLatestCallback(() => {
    googleLogOut();
    storeLogout();
    history.push(goToPath);
  });
  return logOut;
};
