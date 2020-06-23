import React from 'react';

export function useLatestCallback<Args extends any[], Output>(
  callback: (...args: Args) => Output,
): (...args: Args) => Output {
  const callbackRef = React.useRef<(...args: Args) => Output>(callback);
  callbackRef.current = callback;
  return React.useMemo(() => {
    return (...args: Args) => {
      return callbackRef.current(...args);
    };
  }, []);
}
