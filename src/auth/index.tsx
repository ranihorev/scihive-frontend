import React from 'react';
import { GoogleLogin, GoogleLoginProps, GoogleLogout, GoogleLogoutProps } from 'react-google-login';
import { toast } from 'react-toastify';
import { useUserNewStore } from '../stores/userNew';
import { contactsScope, isOnlineResponse } from './utils';
import * as queryString from 'query-string';
import { useLocation, useHistory } from 'react-router';

export const REDIRECT_TO = 'redirect_to';

interface LoginProps {
  onSuccess?: GoogleLoginProps['onSuccess'];
  defaultRedirectTo?: string;
  onFailure?: GoogleLoginProps['onFailure'];
  withContacts?: boolean;
}

export const LoginWithGoogle: React.FC<LoginProps> = React.memo(
  ({ onSuccess, onFailure, defaultRedirectTo, withContacts = true }) => {
    const clientId = process.env.REACT_APP_GOOGLE_ID || '';
    const location = useLocation();
    const history = useHistory();

    if (!clientId) {
      console.error('Client ID is missing!');
    }
    const onGoogleLogicSuccess = useUserNewStore(state => state.onGoogleLogicSuccess);

    return (
      <GoogleLogin
        clientId={clientId}
        buttonText="Login with Google"
        onSuccess={async res => {
          try {
            if (isOnlineResponse(res)) {
              const redirect_to = queryString.parse(location.search)[REDIRECT_TO] || defaultRedirectTo;
              await onGoogleLogicSuccess(res);
              if (redirect_to && typeof redirect_to === 'string') {
                history.push(redirect_to);
              }
              onSuccess?.(res);
            } else {
              onFailure?.(new Error('No online response'));
            }
          } catch (e) {
            toast.error('Failed to log in via Google, please try again');
            onFailure?.(new Error('Failed to login to SciHive'));
          }
        }}
        scope={withContacts ? `profile email ${contactsScope}` : undefined}
        onFailure={response => {
          console.error(response);
          if (onFailure) {
            onFailure(response);
          } else {
            toast.error('Failed to log in via Google, please try again');
          }
        }}
        prompt="select_account"
      />
    );
  },
);

LoginWithGoogle.displayName = 'LoginWithGoogle';

interface LogoutProps {
  onSuccess?: GoogleLogoutProps['onLogoutSuccess'];
  onFailure?: GoogleLogoutProps['onFailure'];
}

export const LogoutWithGoogle: React.FC<LogoutProps> = React.memo(({ onSuccess, onFailure }) => {
  return (
    <GoogleLogout
      clientId={process.env.REACT_APP_GOOGLE_ID || ''}
      onLogoutSuccess={onSuccess}
      onFailure={() => {
        console.error('Failed to logout');
        if (onFailure) {
          onFailure();
        } else {
          toast.error('Failed to log in via Google, please try again');
        }
      }}
    />
  );
});

LogoutWithGoogle.displayName = 'LogoutWithGoogle';
