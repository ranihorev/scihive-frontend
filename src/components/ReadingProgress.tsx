import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from 'react-redux';
import { RootState } from '../models';

interface ReadingProgressRenderProps {
  progress: number;
}

const ReadingProgressRender: React.FC<ReadingProgressRenderProps> = ({ progress }) => {
  return <LinearProgress variant="determinate" value={progress} style={{ zIndex: 1 }} />;
};

const mapStateToProps = (state: RootState) => {
  return {
    progress: state.paper.readingProgress,
  };
};

export const ReadingProgress = connect(mapStateToProps)(ReadingProgressRender);
