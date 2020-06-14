import React from 'react';
import { GoogleLogin } from 'react-google-login';

export const Landing: React.FC = () => {
  const responseGoogle = (response: any) => {
    console.log(response);
  };

  if (!process.env.REACT_APP_GOOGLE_ID) throw Error('Google Client ID is missing');

  return (
    <GoogleLogin
      clientId={process.env.REACT_APP_GOOGLE_ID}
      buttonText="Login with Google"
      onSuccess={responseGoogle}
      onFailure={responseGoogle}
      cookiePolicy={'single_host_origin'}
    />
  );
};
