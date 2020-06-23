import LinearProgress from '@material-ui/core/LinearProgress';
import React from 'react';
import { usePaperStore } from '../stores/paper';

export const ReadingProgress: React.FC = () => {
  const progress = usePaperStore(state => state.readingProgress);
  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      style={{ position: 'sticky', top: 0, left: 0, flexShrink: 0, zIndex: 1 }}
    />
  );
};
