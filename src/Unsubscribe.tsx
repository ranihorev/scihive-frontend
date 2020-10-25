/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import * as Sentry from '@sentry/browser';
import axios from 'axios';
import React from 'react';
import { useParams } from 'react-router';
import baseStyles from './base.module.scss';
import { TopBar } from './topBar';
import { track } from './Tracker';

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
    axios
      .post<{ title: string }>(`/user/unsubscribe/${token}`)
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
    <div className={baseStyles.fullScreen}>
      <TopBar />
      <div className={baseStyles.screenCentered}>
        <Typography>
          {statusToText[status]} {status === 'success' && `"${title}"`}
        </Typography>
      </div>
    </div>
  );
};
