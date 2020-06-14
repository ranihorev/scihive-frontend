import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import AsyncSelect from 'react-select/async';

const clientId = process.env.REACT_APP_GOOGLE_APP_CLIENT_ID || '';
// This is the scope required for readonly access to contacts
const contactsScope = 'https://www.googleapis.com/auth/contacts.readonly';

const GoogleAuth: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkedAccessToContacts, setCheckedAccessToContacts] = useState(false);
    const [hasAccessToContacts, setHasAccessToContacts] = useState(false);

    function checkForAccessToContacts(): void {
      setCheckedAccessToContacts(true);
      // @ts-ignore
      const authInstance: any = window.gapi.auth2.getAuthInstance();
      const isLoggedIn = authInstance.isSignedIn.get();
      if (!isLoggedIn) {
        setHasAccessToContacts(false);
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      const currentUser = authInstance.currentUser.get();
      const scopes = currentUser.getGrantedScopes();
      const contactsInScope = scopes.indexOf(contactsScope) >= 0;
      setHasAccessToContacts(contactsInScope);
    }

    function onAutoLoadFinished(successLogin: boolean) {
      if (!successLogin) {
        // We assume that successLogin should ALWAYS be true here, otherwise we should redirect to a Sign-in page.
        // This is because we would only allow signing in with a Google provider.
      }

      // Once google API has initialized, we should check for access to the user's contacts
      checkForAccessToContacts();
    }

    function onFailure(error: any) {
      // We want to somehow notify the user that we couldn't get the permissions, so they would try again
      console.error(error);
    }

    function onSuccess() {
      // Once we've successfully logged in, let's verify access to contacts
      checkForAccessToContacts();
    }

    // This is just an example of how we might do auto complete to multiple items async
    function renderContactsAutocomplete() {
      function loadGoogleAPIClientAsync() {
        return new Promise((resolve, reject) => {
          gapi.load('client', err => err ? reject(err) : resolve());
        });
      }

      const loadContactSuggestions = async (query: string): Promise<[]> => {
        await loadGoogleAPIClientAsync();
        const { result: { feed: { entry } } } = await gapi.client.request({
          'method': 'GET',
          'path': '/m8/feeds/contacts/default/full',
          'params': {
            'alt': 'json',
            'max-results': 5,
            'q': query,
          },
        });

        return entry
          .map((t: any) => {
            const name = t.title && t.title['$t'];
            const email = t['gd$email'] && t['gd$email'][0] && t['gd$email'][0].address;
            return name && email && {
              value: `${name} <${email}>`,
              label: `${name} <${email}>`,
            };
          })
          .filter((t: any) => !!t);
      };

      return <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadContactSuggestions}
      />;
    }

    const permissionsVerifiedAsMissing = checkedAccessToContacts && !hasAccessToContacts;

  return (
      <div>
        {/* We always load the login component, since it initialized the API for us, even when it's hidden */}
        <GoogleLogin
          className={permissionsVerifiedAsMissing ? '' : 'hidden'}
          clientId={clientId}
          // Here, we initialize to the scope to be the contacts scope, but in the actual app we'll need to leave
          // it blank for signup/signin, and only include it when asking for permissions. In this example, the whole
          // flow is done in in place so we have to provide it as the gapi initializes
          scope={contactsScope}
          onAutoLoadFinished={onAutoLoadFinished}
          onSuccess={onSuccess}
          onFailure={onFailure}
          isSignedIn={true}
        >{isLoggedIn ? 'Grant access to Contacts' : 'Continue with Google'}</GoogleLogin>

        {!checkedAccessToContacts && <div>Checking access to Contacts...</div>}
        {hasAccessToContacts && renderContactsAutocomplete()}
      </div>
    );
  }
;

export default GoogleAuth;