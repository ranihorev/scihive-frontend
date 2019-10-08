import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import useReactRouter from 'use-react-router';

ReactGA.initialize('UA-88259675-7');

export const useTracker = (options = {}) => {
  const trackPage = React.useCallback(
    (page: string) => {
      ReactGA.set({
        page,
        ...options,
      });
      ReactGA.pageview(page);
    },
    [options],
  );
  const { location } = useReactRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      trackPage(location.pathname + location.search);
    } else {
      console.log(`Track: ${location.pathname + location.search}`);
    }
  }, [trackPage, location.pathname, location.search]);

  return null;
};
