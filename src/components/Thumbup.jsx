import React from "react";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";

const Thumbup = props => {
  return (
    <React.Fragment>
      {props.selected ? <ThumbUpIcon /> : <ThumbUpIcon />}
    </React.Fragment>
  );
};

export default Thumbup;
