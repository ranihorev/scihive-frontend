import React from 'react';

export function useLatestCallback<Args extends any[], Output>(
  fn: (...args: Args) => Output,
  dependencies: any[],
): (...args: Args) => Output {
  const ref = React.useRef<(...args: Args) => Output>(fn);

  React.useLayoutEffect(() => {
    ref.current = fn;
  }, dependencies);

  return React.useCallback(
    (...args: any[]) => {
      const fn = ref.current;
      return fn(...(args as Args));
    },
    [ref],
  );
}
