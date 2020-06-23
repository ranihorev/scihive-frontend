import { pick } from 'lodash';
import { GoogleLoginResponse, GoogleLoginResponseOffline, useGoogleLogin } from 'react-google-login';
import shallow from 'zustand/shallow';
import { useUserNewStore } from '../stores/userNew';

export const contactsScope = 'https://www.googleapis.com/auth/contacts.readonly';

export const isOnlineResponse = (res: GoogleLoginResponse | GoogleLoginResponseOffline): res is GoogleLoginResponse => {
  return 'tokenId' in res && 'profileObj' in res;
};

export const useIsLoggedIn = () => {
  const { setStatus, status, onGoogleLogicSuccess } = useUserNewStore(
    state => pick(state, ['setStatus', 'status', 'onGoogleLogicSuccess']),
    shallow,
  );

  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
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
      }
    },
    onFailure: () => {},
    isSignedIn: true, // TODO: get this from localstorage
    scope: `profile email ${contactsScope}`,
  });
  return status;
};

export const useHasContactsPermission = () => {
  const status = useIsLoggedIn();
  const { contactsPermission, setContactsPermission } = useUserNewStore(
    state => pick(state, ['contactsPermission', 'setContactsPermission']),
    shallow,
  );
  if (status !== 'loggedIn') return false;
  if (contactsPermission) return true; // We assume that the permissions won't be removed after approval
  const authInstance = window.gapi.auth2.getAuthInstance();
  const currentUser = authInstance.currentUser.get();
  const scopes = currentUser.getGrantedScopes();
  const contactsInScope = scopes.indexOf(contactsScope) >= 0;
  if (contactsPermission !== contactsInScope) {
    setContactsPermission(contactsInScope);
  }
  return contactsInScope;
};
