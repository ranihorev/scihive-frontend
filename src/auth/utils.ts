import axios from 'axios';
import { pick } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import { GoogleLoginResponse, GoogleLoginResponseOffline, useGoogleLogin, useGoogleLogout } from 'react-google-login';
import { useHistory, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { AccountProvider, ProfileResponse, useUserStore } from '../stores/user';
import { useLatestCallback } from '../utils/useLatestCallback';

export const contactsScope = 'https://www.googleapis.com/auth/contacts.readonly';

export const isOnlineResponse = (res: GoogleLoginResponse | GoogleLoginResponseOffline): res is GoogleLoginResponse => {
  return 'tokenId' in res && 'profileObj' in res;
};

export const REDIRECT_TO = 'redirect_to';
const STORAGE_KEY = 'loginProvider';

export const storeUserLocally = (provider: AccountProvider) => {
  localStorage.setItem(STORAGE_KEY, provider);
};

// Deprecated - we now use the auth server cookie instead
export const useIsLoggedInViaGoogle = () => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const loginProvider = localStorage.getItem(STORAGE_KEY);
  const isGoogleLogin = loginProvider === 'Google';
  const { setStatus, status, onGoogleLogicSuccess } = useUserStore(
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
  const { setStatus, status, setProfile } = useUserStore(
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
        setProfile(profile);
      } else {
        setStatus('notAuthenticated');
      }
    });
  }, [setProfile, setStatus, status]);

  return status;
};

export const useHasContactsPermission = () => {
  const shownError = React.useRef(false);
  const { status, contactsPermission, setContactsPermission } = useUserStore(
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
  const storeLogout = useUserStore(state => state.onLogout);
  const { signOut: googleLogOut } = useGoogleLogout({ clientId: process.env.REACT_APP_GOOGLE_ID });
  const logOut = useLatestCallback(() => {
    googleLogOut();
    storeLogout();
    history.push(goToPath);
  });
  return logOut;
};

export const useRedirectTo = (defaultRedirectTo?: string) => {
  const location = useLocation();
  const history = useHistory();
  return () => {
    const redirect_to = queryString.parse(location.search)[REDIRECT_TO] || defaultRedirectTo;
    if (redirect_to && typeof redirect_to === 'string') {
      history.push(redirect_to);
    }
  };
};
