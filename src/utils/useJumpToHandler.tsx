import { pick } from 'lodash';
// @ts-ignore
import { PDFViewer, CSS_UNITS } from 'pdfjs-dist/web/pdf_viewer';
import React from 'react';
import { useLocation } from 'react-router';
import shallow from 'zustand/shallow';
import { createEvent, createListener, getSectionPosition } from '.';
import { AllHighlight, isGeneralHighlight, PaperJump, Section } from '../models';
import { scaledToViewport } from '../paper/pdfUtils/coordinates';
import { usePaperStore } from '../stores/paper';

export const JUMP_TO_EVENT = 'jumpToPaperLocation';

interface CreateJumpToEventProps {
  type: 'section' | 'highlight';
  id: string;
  sections: Section[];
  highlights: AllHighlight[];
}

const createJumpToEvent = ({ type, id, sections, highlights }: CreateJumpToEventProps) => {
  let jumpData: PaperJump;
  if (type === 'section') {
    const currentSection = (sections || [])[parseInt(id)];
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

  const { highlights, isDocumentReady, highlightsState, sections } = usePaperStore(
    state => pick(state, ['highlights', 'isDocumentReady', 'highlightsState', 'sections']),
    shallow,
  );

  React.useEffect(() => {
    if (parsedHash.current) return; // This runs only once on load;
    if (!isDocumentReady || highlightsState !== 'loaded' || sections === undefined) return;
    const jumpToRegex = /(?<type>(section|highlight))-(?<id>\d+)/;
    const groups = hash.match(jumpToRegex)?.groups;
    if (groups && (groups.type === 'highlight' || groups.type === 'section')) {
      const newEvent = createJumpToEvent({ type: groups.type, id: groups.id, highlights, sections });
      if (newEvent) {
        document.dispatchEvent(newEvent);
        parsedHash.current = true;
      }
    }
  }, [isDocumentReady, highlightsState, hash, highlights, sections]);

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
        // scroll to section
        inPageOffset = page.viewport.convertToViewportPoint(0, event.detail.location.position)[1];
      }
      if (inPageOffset !== undefined) {
        window.scrollTo({ top: (page.div as HTMLDivElement).offsetTop + inPageOffset - scrollMargin });
      }
    });
  }, [viewer]);
};
