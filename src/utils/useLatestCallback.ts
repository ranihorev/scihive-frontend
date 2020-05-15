import React from 'react';

export function useLatestCallback<Args extends any[], Output>(
  fn: (...args: Args) => Output,
  dependencies: React.DependencyList,
): (...args: Args) => Output {
  const ref = React.useRef<(...args: Args) => Output>(fn);

  React.useLayoutEffect(() => {
    ref.current = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, fn]);

  return React.useCallback(
    (...args: any[]) => {
      const fn = ref.current;
      return fn(...(args as Args));
    },
    [ref],
  );
}
