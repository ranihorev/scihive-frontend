import { useGoogleLogin } from 'react-google-login';
import { useUserNewStore } from '../stores/userNew';
import shallow from 'zustand/shallow';
import { pick } from 'lodash';

export const contactsScope = 'https://www.googleapis.com/auth/contacts.readonly';

export const useIsLoggedIn = () => {
  const { setStatus, status } = useUserNewStore(state => pick(state, ['setStatus', 'status']), shallow);
  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');
  useGoogleLogin({
    clientId: process.env.REACT_APP_GOOGLE_ID,
    onAutoLoadFinished: isIn => {
      setStatus(isIn ? 'loggedIn' : 'notAuthenticated');
    },
    onSuccess: () => {},
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
