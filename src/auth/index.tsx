import React from 'react';
import { GoogleLogin, GoogleLoginProps, GoogleLogout, GoogleLogoutProps } from 'react-google-login';
import { toast } from 'react-toastify';
import { contactsScope } from './utils';

interface LoginProps {
  onSuccess: GoogleLoginProps['onSuccess'];
  onFailure?: GoogleLoginProps['onFailure'];
  withContacts?: boolean;
}
export const LoginWithGoogle: React.FC<LoginProps> = React.memo(({ onSuccess, onFailure, withContacts = true }) => {
  const clientId = process.env.REACT_APP_GOOGLE_ID || '';
  if (!clientId) {
    console.error('Client ID is missing!');
  }
  return (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login with Google"
      onSuccess={onSuccess}
      scope={withContacts ? `profile email ${contactsScope}` : undefined}
      onFailure={response => {
        console.error(response);
        if (onFailure) {
          onFailure(response);
        } else {
          toast.error('Failed to log in via Google, please try again');
        }
      }}
    />
  );
});

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
