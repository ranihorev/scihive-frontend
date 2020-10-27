import * as mixpanel from 'mixpanel-browser';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router';

ReactGA.initialize('UA-88259675-7');
if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);
}

export const track: typeof mixpanel.track = (event, properties) => {
  mixpanel.track(event, properties);
  if (process.env.NODE_ENV === 'development') {
    console.log(event, properties);
  }
};

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
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname + location.search;
    if (process.env.NODE_ENV !== 'development') {
      trackPage(page);
    } else {
      console.log(`Track: ${page}`);
    }
    track('PageView', { page });
  }, [trackPage, location.pathname, location.search]);

  return null;
};
