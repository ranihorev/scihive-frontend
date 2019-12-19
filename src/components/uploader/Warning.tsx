/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import React from 'react';

export const Warning: React.FC = () => (
  <Typography variant="caption" component="div" css={{ marginTop: 8, marginBottom: 8 }}>
    Before deciding to upload a paper, please recall that some scientific papers have copyrights. SciHive takes no
    responsibility for the content you upload. You should do it at your own risk.
  </Typography>
);
