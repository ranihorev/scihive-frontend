import { pick } from 'lodash';
// @ts-ignore
import { PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { scaledToViewport } from '../lib/coordinates';
import { PaperJump } from '../../../models';

interface Props {
  viewer: PDFViewer;
  renderHighlights: (pageNumber: number) => void;
}

export const useJumpToHandler = ({ viewer, renderHighlights }: Props) => {
  const prevJumpData = React.useRef<PaperJump | undefined>(undefined);

  const { paperJumpData, clearPaperJumpTo } = usePaperStore(
    state => pick(state, ['paperJumpData', 'clearPaperJumpTo']),
    shallow,
  );
  React.useEffect(() => {
    if (!paperJumpData) return;

    const onScroll = () => {
      // TODO: clean hash
      // window.location.hash = '';
      viewer.current.container.removeEventListener('scroll', onScroll);
      clearPaperJumpTo();
    };

    if (paperJumpData.type === 'highlight') {
      // Scrool to highlight
      const { pageNumber, boundingRect } = paperJumpData.location;
      const pageViewport = viewer.current.getPageView(pageNumber - 1).viewport;
      const scrollMargin = 30;
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
