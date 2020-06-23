import React from 'react';
import { GoogleLogin, GoogleLoginProps, GoogleLogout, GoogleLogoutProps } from 'react-google-login';
import { toast } from 'react-toastify';
import { contactsScope, isOnlineResponse } from './utils';
import Axios from 'axios';
import { useUserNewStore } from '../stores/userNew';

interface LoginProps {
  onSuccess?: GoogleLoginProps['onSuccess'];
  onFailure?: GoogleLoginProps['onFailure'];
  withContacts?: boolean;
}
export const LoginWithGoogle: React.FC<LoginProps> = React.memo(({ onSuccess, onFailure, withContacts = true }) => {
  const clientId = process.env.REACT_APP_GOOGLE_ID || '';
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
            onGoogleLogicSuccess(res);
            onSuccess?.(res);
          }
          onFailure?.(new Error('No online response'));
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
});

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
