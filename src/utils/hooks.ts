import React from 'react';

export const useOnClickOutside = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: MouseEvent | TouchEvent) => void,
  isActive: boolean = true,
) => {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    if (isActive) {
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
    } else {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    }

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, isActive]);
};
