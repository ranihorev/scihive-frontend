/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import React from 'react';

export const Warning: React.FC = () => (
  <Typography variant="caption" component="div" css={{ marginTop: 8, marginBottom: 8 }}>
    Upload at your own risk warning, paper might be removed, paper is not publicly searchable, links are not protect,
    don't post on public space
  </Typography>
);
