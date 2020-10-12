import * as queryString from 'query-string';
import React from 'react';
import { useLocation, useParams } from 'react-router';
import ResizeObserver from 'resize-observer-polyfill';

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
  React.useLayoutEffect(() => {
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

const isTextNode = (element: ChildNode | null): element is Text => {
  return element?.nodeName === '#text';
};

const findOnboardingNode = (elements: HTMLDivElement[], thresholdPx: number = 100, length: number = 30) => {
  for (const elem of elements) {
    if (Math.abs(elem.offsetTop - window.innerHeight / 2) < thresholdPx) {
      if (isTextNode(elem.firstChild) && elem.firstChild.length > length) {
        return elem.firstChild as Text;
      }
    }
  }
  return;
};

export const activateOnboarding = (textLayer: any) => {
  const maxSelected = 80;
  const period = 70;

  let timeoutId: NodeJS.Timeout;
  const range = document.createRange();
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }

  const elements = textLayer.textLayerDiv.children;
  const node = findOnboardingNode(elements, 100, 30) || findOnboardingNode(elements, 200, 30);
  if (!node) return;
  const selectChars = (endPosition: number) => {
    if (endPosition > maxSelected) return;
    try {
      if (endPosition >= node.length) return;
      range.setStart(node, 0);
      range.setEnd(node, endPosition);
      timeoutId = setTimeout(() => selectChars(endPosition + 2), period);
    } catch (e) {
      console.warn('Failed to select range');
    }
  };
  timeoutId = setTimeout(() => {
    selectChars(1);
  }, period);

  return () => {
    clearTimeout(timeoutId);
  };
};

export const useQueryString = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};
