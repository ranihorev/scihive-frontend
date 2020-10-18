import * as queryString from 'query-string';
import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router';

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

export const useToken = (): string | undefined => {
  const queryString = useQueryString();
  return typeof queryString.token === 'string' ? queryString.token : undefined;
};

export const useQueryUploadLink = () => {
  const query = useQueryString();
  const uploadLink = query.uploadLink || query.upload_link; // Supports old and new version of the extension
  if (typeof uploadLink === 'string') return uploadLink;
  return '';
};

export const useUploadViaUrl = () => {
  const history = useHistory();
  const uploadLink = useQueryUploadLink();
  React.useEffect(() => {
    if (!uploadLink) return;
    if (history.location.pathname === '/upload') return;
    history.push(`/upload?${queryString.stringify({ uploadLink })}`);
  }, [uploadLink, history]);
};
