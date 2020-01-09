import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { usePaperStore } from '../stores/paper';

export const ReadingProgress: React.FC = () => {
  const progress = usePaperStore(state => state.readingProgress);
  return <LinearProgress variant="determinate" value={progress} style={{ zIndex: 1 }} />;
};
