import React from 'react';
import LinearProgress from "@material-ui/core/LinearProgress";
import {connect} from "react-redux";


const ReadingProgress = ({progress}) => {
  return <LinearProgress variant="determinate" value={progress} />
}

const mapStateToProps = (state, ownProps) => {
  return {
    progress: state.paper.readingProgress,
  }
};

const withRedux = connect(mapStateToProps, null);

export default withRedux(ReadingProgress);