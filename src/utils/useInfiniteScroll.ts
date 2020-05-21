import React from 'react';
import { useLatestCallback } from './useLatestCallback';

export const useInfiniteScroll = (
  fetchMore: (page: number) => Promise<boolean>,
  dependencies: React.DependencyList,
  { initialLoad, thresholdPx }: { initialLoad: boolean; thresholdPx: number },
) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const pageNum = React.useRef(0);

  const handleLoading = useLatestCallback(async () => {
    pageNum.current += 1;
    setIsLoading(true);
    setHasMore(await fetchMore(pageNum.current));
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoading, ...dependencies]);

  React.useLayoutEffect(() => {
    pageNum.current = 0;
    if (initialLoad) {
      handleLoading();
    } else {
      setHasMore(true);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, ...dependencies]);

  React.useEffect(() => {
    if (!hasMore) return () => {};
    const onScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - thresholdPx;
      if (isLoading || !bottom) return;
      handleLoading();
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleLoading, thresholdPx, hasMore, isLoading]);

  return { isLoading, hasMore: hasMore };
};
