import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { usePaperStore } from '../stores/paper';
import styles from './ReadingProgress.module.scss';

export const ReadingProgress: React.FC = () => {
  const progress = usePaperStore(state => state.readingProgress);
  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      className={styles.root}
      classes={{ bar1Determinate: styles.bar }}
    />
  );
};
