import { pick } from 'lodash';
// @ts-ignore
import { PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import React from 'react';
import { useLocation } from 'react-router';
import shallow from 'zustand/shallow';
import { createEvent, createListener, getSectionPosition } from '.';
import { AllHighlight, isGeneralHighlight, PaperJump, TableOfContents } from '../models';
import { scaledToViewport } from '../paper/pdfUtils/coordinates';
import { usePaperStore } from '../stores/paper';

export const JUMP_TO_EVENT = 'jumpToPaperLocation';

interface CreateJumpToEventProps {
  type: 'section' | 'highlight';
  id: string;
  tableOfContents: TableOfContents;
  highlights: AllHighlight[];
}

const createJumpToEvent = ({ type, id, tableOfContents, highlights }: CreateJumpToEventProps) => {
  let jumpData: PaperJump;
  if (type === 'section') {
    const currentSection = (tableOfContents || [])[parseInt(id)];
    if (!currentSection) return undefined;
    jumpData = {
      area: 'paper',
      type: 'section',
      id: id,
      location: getSectionPosition(currentSection),
    };
  } else {
    // type === 'highlight'
    const matchingComment = highlights.find(h => h.id === id);
    if (!matchingComment || isGeneralHighlight(matchingComment)) return undefined;
    jumpData = {
      id: matchingComment.id,
      area: 'paper',
      type: 'highlight',
      location: matchingComment.position,
    };
  }
  if (jumpData) {
    return createEvent<PaperJump>(JUMP_TO_EVENT, jumpData);
  }
  return undefined;
};

export const useJumpToHandler = (viewer: PDFViewer) => {
  const { hash } = useLocation();
  const parsedHash = React.useRef(false);

  const { highlights, isDocumentReady, highlightsState, tableOfContents } = usePaperStore(
    state => pick(state, ['highlights', 'isDocumentReady', 'highlightsState', 'tableOfContents']),
    shallow,
  );

  React.useEffect(() => {
    // This runs only once on load;
    if (parsedHash.current) return;
    if (!isDocumentReady || highlightsState !== 'loaded' || tableOfContents === undefined) return;
    const jumpToRegex = /(?<type>(section|highlight))-(?<id>\d+)/;
    const groups = hash.match(jumpToRegex)?.groups;
    if (groups && (groups.type === 'highlight' || groups.type === 'section')) {
      const newEvent = createJumpToEvent({ type: groups.type, id: groups.id, highlights, tableOfContents });
      if (newEvent) {
        document.dispatchEvent(newEvent);
        parsedHash.current = true;
      }
    }
  }, [isDocumentReady, highlightsState, hash, highlights, tableOfContents]);

  React.useEffect(() => {
    return createListener<PaperJump>(JUMP_TO_EVENT, event => {
      const page = viewer.current.getPageView(event.detail.location.pageNumber - 1);
      const scrollMargin = 30;
      let inPageOffset: number | undefined;
      if (event.detail.type === 'highlight') {
        const { boundingRect } = event.detail.location;
        if (page && page.div) {
          inPageOffset = scaledToViewport(boundingRect, page.viewport, false).top;
        }
      } else {
        // scroll to section.
        // Section coordinates from the backend are relative to the top while PDF coordinates are relative to the bottom of the page
        // viewBox[3] is the height in PDF units
        inPageOffset = page.viewport.convertToViewportPoint(
          0,
          page.viewport.viewBox[3] - event.detail.location.position,
        )[1];
      }
      if (inPageOffset !== undefined) {
        window.scrollTo({ top: (page.div as HTMLDivElement).offsetTop + inPageOffset - scrollMargin });
      }
    });
  }, [viewer]);
};
