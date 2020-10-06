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

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Deprecated - we now use the auth server cookie instead
export const useLogInViaGoogle = () => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const onGoogleLogicSuccess = useUserStore(state => state.onGoogleLogicSuccess);
  return useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_ID,
    onSuccess: async res => {
      if (isOnlineResponse(res)) {
        onGoogleLogicSuccess(res);
        storeUserLocally('Google');
      }
    },
    onFailure: e => {},
    autoLoad: false,
    scope: `profile email ${contactsScope}`,
  });
};

export const useIsLoggedIn = () => {
  const { setStatus, status, setProfile, onLogout, setGoogleData } = useUserStore(
    state => pick(state, ['setStatus', 'status', 'setProfile', 'onLogout', 'setGoogleData']),
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

  useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_ID,
    onSuccess: res => {},
    onFailure: () => {},
    onAutoLoadFinished: () => {
      if (localStorage.getItem(STORAGE_KEY) !== 'Google') return;
      const instance = window.gapi.auth2.getAuthInstance();
      const user = instance.currentUser.get();
      if (!user.isSignedIn()) {
        onLogout();
      } else {
        setGoogleData({
          token: user.getAuthResponse().access_token,
          googleId: user.getId(),
          imageUrl: user.getBasicProfile().getImageUrl(),
        });
      }
    },
  });

  return status;
};

export const useHasContactsPermission = () => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const shownError = React.useRef(false);
  const { status, contactsPermission, setContactsPermission, profile } = useUserStore(
    state => pick(state, ['status', 'contactsPermission', 'setContactsPermission', 'profile']),
    shallow,
  );

  const updatePermissionsStatus = useLatestCallback(() => {
    if (status !== 'loggedIn') return;
    if (contactsPermission) return; // We assume that the permissions won't be removed after approval
    const instance = window.gapi.auth2.getAuthInstance();
    const user = instance.currentUser.get();
    if (!user.isSignedIn()) return;
    const scopes = user.getGrantedScopes();
    const contactsInScope = scopes.indexOf(contactsScope) >= 0;
    if (contactsPermission !== contactsInScope) {
      setContactsPermission(contactsInScope);
    }
    shownError.current = false;
  });

  const { loaded } = useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_ID,
    onSuccess: () => {},
    onFailure: () => {},
    autoLoad: false,
    onAutoLoadFinished: () => {
      updatePermissionsStatus();
    },
  });

  React.useEffect(() => {
    updatePermissionsStatus();
  }, [status, updatePermissionsStatus, profile?.googleData]);

  const grantPermissions = () => {
    const instance = window.gapi.auth2.getAuthInstance();
    const user = instance.currentUser.get();
    user.grant({ scope: contactsScope }).then(
      () => {
        updatePermissionsStatus();
      },
      (err: any) => {
        console.error(err);
      },
    );
  };
  return {
    isLoggedInGoogle: Boolean(profile?.googleData),
    hasPermissions: contactsPermission,
    grantPermissions: loaded ? grantPermissions : undefined,
  };
};

export const useLogout = (goToPath: string) => {
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  const history = useHistory();
  const storeLogout = useUserStore(state => state.onLogout);
  const { signOut: googleLogOut } = useGoogleLogout({ clientId: process.env.REACT_APP_GOOGLE_ID });
  const logOut = useLatestCallback(() => {
    removeUserFromLocalStorage();
    googleLogOut();
    storeLogout();
    history.push(goToPath);
  });
  return logOut;
};

export const useRedirectTo = (defaultRedirectTo?: string, enabled: boolean = true) => {
  const location = useLocation();
  const history = useHistory();
  return () => {
    if (!enabled) return;
    const redirect_to = queryString.parse(location.search)[REDIRECT_TO] || defaultRedirectTo;
    if (redirect_to && typeof redirect_to === 'string') {
      history.push(redirect_to);
    }
  };
};
