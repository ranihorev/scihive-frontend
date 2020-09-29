import { pick } from 'lodash';
// @ts-ignore
import { PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { scaledToViewport } from '../lib/coordinates';
import { PaperJump } from '../../../models';
import { useLocation } from 'react-router';

interface Props {
  viewer: PDFViewer;
  renderHighlights: (pageNumber: number) => void;
}

export const useJumpToHandler = ({ viewer, renderHighlights }: Props) => {
  const prevJumpData = React.useRef<PaperJump | undefined>(undefined);
  const { hash } = useLocation();

  const { paperJumpData, clearPaperJumpTo, setPaperJumpTo, isDocumentReady, highlightsState, sections } = usePaperStore(
    state =>
      pick(state, [
        'paperJumpData',
        'clearPaperJumpTo',
        'setPaperJumpTo',
        'isDocumentReady',
        'highlightsState',
        'sections',
      ]),
    shallow,
  );

  React.useEffect(() => {
    if (!isDocumentReady || highlightsState !== 'loaded' || sections === undefined) return;
    const jumpToRegex = /(?<type>(section|highlight))-(?<id>\d+)/;
    const groups = hash.match(jumpToRegex)?.groups;
    if (groups && (groups.type === 'highlight' || groups.type === 'section')) {
      setPaperJumpTo({ type: groups.type, id: groups.id });
    }
  }, [isDocumentReady, highlightsState, hash, setPaperJumpTo, sections]);

  React.useEffect(() => {
    if (!paperJumpData) return;

    const onScroll = () => {
      // TODO: clean hash
      // window.location.hash = '';
      viewer.current.container.removeEventListener('scroll', onScroll);
      clearPaperJumpTo();
    };

    if (paperJumpData.type === 'highlight') {
      // Scroll to highlight
      const { pageNumber, boundingRect } = paperJumpData.location;
      const pageViewport = viewer.current.getPageView(pageNumber - 1).viewport;
      const scrollMargin = 30;
      console.log('scroll', pageNumber);
      viewer.current.scrollPageIntoView({
        pageNumber,
        destArray: [
          null,
          { name: 'XYZ' },
          ...pageViewport.convertToPdfPoint(0, scaledToViewport(boundingRect, pageViewport, false).top - scrollMargin),
          0,
        ],
      });
    } else {
      // scroll to section
      const { pageNumber, position } = paperJumpData.location;
      viewer.current.scrollPageIntoView({
        pageNumber,
        destArray: [null, { name: 'XYZ' }, 0, position],
      });
    }
    // wait for scrolling to finish
    const timeoutId = setTimeout(() => {
      viewer.current.container.addEventListener('scroll', onScroll);
    }, 200);

    return () => {
      viewer.current.container.removeEventListener('scroll', onScroll);
      clearTimeout(timeoutId);
    };
  }, [paperJumpData, clearPaperJumpTo, viewer]);

  React.useEffect(() => {
    let renderedPageNumber: number | undefined = undefined;
    if (prevJumpData.current && prevJumpData.current.type === 'highlight') {
      renderedPageNumber = prevJumpData.current.location.pageNumber;
      renderHighlights(renderedPageNumber);
    }
    if (
      paperJumpData &&
      paperJumpData.type === 'highlight' &&
      paperJumpData.location.pageNumber !== renderedPageNumber
    ) {
      renderHighlights(paperJumpData.location.pageNumber);
    }

    prevJumpData.current = paperJumpData;
  }, [paperJumpData]);
};
