/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export const CenteredFullScreen: React.FC = ({ children }) => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100vw',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
};
