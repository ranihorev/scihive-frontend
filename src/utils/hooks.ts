import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { useParams } from 'react-router';

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

export const useResizeObserver = (
  domRef: React.RefObject<HTMLElement>,
  onResize: (rect: ResizeObserverEntry['contentRect']) => void,
) => {
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const entry = entries[0];
        onResize(entry.contentRect);
      });
    });

    if (domRef.current) resizeObserver.observe(domRef.current);
    const element = domRef.current;
    return () => {
      if (element) resizeObserver.unobserve(element);
    };
  }, [domRef, onResize]);
};

export const usePaperId = () => {
  const { field, paperId } = useParams<{ field?: string; paperId: string }>();
  if (field) return `${field}_${paperId}`;
  return paperId;
};
