import { CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { Spacer } from '../utils/Spacer';
import styles from './Paper.module.css';

export const LoaderPlaceholder = () => (
  <div className={styles.fullScreen}>
    <Typography>Loading Paper</Typography>
    <Spacer size={8} />
    <CircularProgress />
  </div>
);
