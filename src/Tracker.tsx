import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import useReactRouter from 'use-react-router';
import * as mixpanel from 'mixpanel-browser';
import { Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { actions, Action } from './actions';

ReactGA.initialize('UA-88259675-7');
if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, { debug: process.env.NODE_ENV === 'development' });
}

export const track: typeof mixpanel.track = (event, properties) => {
  mixpanel.track(event, properties);
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
  const { location } = useReactRouter();

  useEffect(() => {
    const page = location.pathname + location.search;
    if (process.env.NODE_ENV !== 'development') {
      trackPage(page);
    } else {
      console.log(`Track: ${page}`);
    }
    mixpanel.track('pageView', { page });
  }, [trackPage, location.pathname, location.search]);

  return null;
};

export const trackerMiddleware: Middleware = ({ getState }: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
  if (typeof action === 'object') {
    const actionType = action.type as keyof typeof actionsHandler;
    const handler = actionsHandler[actionType];
    let data = undefined;
    if (handler) {
      data = handler(action as any, getState());
    }
    if (data !== null) {
      track(action.type, data);
    }
  }
  const returnValue = next(action);
  return returnValue;
};

const actionsHandler: {
  [K in keyof typeof actions]?: (action: ReturnType<typeof actions[K]>, state: RootState) => object | null;
} = {
  setUser: () => null,
  setGroups: () => null,
  toggleCategoriesModal: () => null,
  updateReadingProgress: () => null,
  toggleLoginModal: () => null,
  toggleGroupsModal: () => null,
  setTotalPapers: () => null,
  addPapers: () => null,
  clearPapers: () => null,
};
