import React, { useEffect } from "react";
import ReactGA from "react-ga";

ReactGA.initialize('UA-88259675-7');

export const withTracker = (WrappedComponent, options = {}) => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    });
    ReactGA.pageview(page);
  };

  const HOC = props => {
    useEffect(() => {
      if (process.env.NODE_ENV !== 'development') {
        trackPage(props.location.pathname + props.location.search);
      } else {
        console.log(`Track: ${props.location.pathname + props.location.search}`);
      }
    },
      [ props.location.pathname, props.location.search,]);

    return <WrappedComponent {...props} />;
  };

  return HOC;
};