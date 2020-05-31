/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as Sentry from '@sentry/browser';
import Axios from 'axios';
import React from 'react';
import { useParams } from 'react-router';
import { track } from '../Tracker';
import { BasePage } from './BasePage';

type Status = 'sending' | 'success' | 'error';

const statusToText: { [key in Status]: string } = {
  sending: 'Processing...',
  success: 'You have muted',
  error: 'Failed to unsubscribe, please try again',
};

export const Unsubscribe: React.FC = () => {
  const [status, setStatus] = React.useState<Status>('sending');
  const [title, setTitle] = React.useState('');
  const { token } = useParams<{ token: string }>();
  React.useEffect(() => {
    track('unsubscribe'); // TODO: provide paper_id in the link
    Axios.post<{ title: string }>(`/user/unsubscribe/${token}`)
      .then(res => {
        setStatus('success');
        setTitle(res.data.title);
      })
      .catch(e => {
        setStatus('error');
        Sentry.captureException(e);
      });
  }, [token]);

  return (
    <BasePage title="SciHive - Mute Thread">
      <div css={{ padding: 40 }}>
        {statusToText[status]} {status === 'success' && `"${title}"`}
      </div>
    </BasePage>
  );
};
