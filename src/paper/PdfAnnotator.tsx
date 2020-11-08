/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Fab from '@material-ui/core/Fab';
import cx from 'classnames';
import { pick, throttle } from 'lodash';
import { PDFDocumentProxy } from 'pdfjs-dist';
// @ts-ignore
import { EventBus, PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import React from 'react';
import ReactDom from 'react-dom';
import shallow from 'zustand/shallow';
import { isDirectHighlight, T_Highlight, T_NewHighlight, T_Position } from '../models';
import { usePaperStore } from '../stores/paper';
import { Spacer } from '../utils/Spacer';
import { useJumpToHandler } from '../utils/useJumpToHandler';
import { useLatestCallback } from '../utils/useLatestCallback';
import { NewHighlightContainer } from './highlights/NewHighlightContainer';
import { PageHighlights } from './highlights/PageHighlights';
import styles from './PdfAnnotator.module.scss';
import { viewportPositionToScaled } from './pdfUtils/coordinates';
import getBoundingRect from './pdfUtils/get-bounding-rect';
import getClientRects from './pdfUtils/get-client-rects';
import { findOrCreateLayer, getElementFromRange, getPageFromRange } from './pdfUtils/pdfjs-dom';
import { ActiveReference, ReferencesPopupManager, useRenderCitations, useToggleReferencesOnMove } from './references';
import { useCommentsSocket } from './useCommentsSocket';

const zoomButtonCss = css`
  color: black;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const ZoomButton = ({ direction, onClick }: any) => (
  <div>
    <Fab
      color="default"
      aria-label={direction === 'in' ? 'zoom-in' : 'zoom-out'}
      onClick={onClick}
      size="small"
      css={zoomButtonCss}
    >
      <i className={`fas fa-search-${direction === 'in' ? 'plus' : 'minus'}`} />
    </Fab>
  </div>
);

interface PdfAnnotatorProps {
  pdfDocument: PDFDocumentProxy;
  initialWidth?: number;
  viewer: React.MutableRefObject<PDFViewer>;
}

// TODO: improve typing here
// const jumpToCite = async (doc: any, href: string) => {
//   doc
//     .getDestination(href.replace('#', ''))
//     .then((citePos: any) =>
//       doc.getPageIndex(citePos[0]).then((pageNumber: number) => {
//         document.dispatchEvent(
//           createEvent<PaperJump>(JUMP_TO_EVENT, {
//             area: 'paper',
//             type: 'section',
//             id: href,
//             location: { pageNumber: pageNumber + 1, position: citePos[3] },
//           }),
//         );
//       }),
//     )
//     .catch((e: any) => console.warn(e));
// };

const PdfAnnotator: React.FC<PdfAnnotatorProps> = ({ pdfDocument, initialWidth, viewer }) => {
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [activeReference, setActiveReference] = React.useState<ActiveReference | undefined>();
  const lastTempHighlightPage = React.useRef<number | undefined>();
  const selectionTextLayerRef = React.useRef<HTMLElement | null>(null);
  const pagesReadyToRender = React.useRef<number[]>([]);
  const zoomTimeout = React.useRef<number | undefined>();

  const {
    highlights,
    updateReadingProgress,
    clearTempHighlight,
    tempHighlight,
    setTempHighlight,
    isDocumentReady,
    setDocumentReady,
  } = usePaperStore(
    state => ({
      ...pick(state, [
        'highlights',
        'updateReadingProgress',
        'setTempHighlight',
        'tempHighlight',
        'clearTempHighlight',
        'isDocumentReady',
        'setDocumentReady',
      ]),
    }),
    shallow,
  );

  useCommentsSocket();

  const renderCitations = useRenderCitations({ viewer, isDocumentReady, pagesReadyToRender });
  const onMouseMove = useToggleReferencesOnMove(isSelecting, setActiveReference);

  const containerNode = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      clearTempHighlight();
    }
  });

  const onDocumentReady = useLatestCallback(() => {
    if (!containerNode.current) {
      console.error('Container node is not initialized');
      return;
    }
    if (!initialWidth) {
      viewer.current.currentScaleValue = 'page-width';
      viewer.current.currentScale *= 0.9;
    } else {
      const { viewport } = viewer.current.getPageView(0);
      viewer.current.currentScale = initialWidth / viewport.width - 0.1;
    }
    containerNode.current.scrollTop = 0;
    setDocumentReady();
  });

  const onTextSelection = useLatestCallback((newRange: Range) => {
    const page = getPageFromRange(newRange);
    if (!page) return;
    const rects = getClientRects(newRange, page.node);
    if (rects.length === 0) return;

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const highlighted_text: T_NewHighlight['highlighted_text'] = newRange.toString();
    renderTipAtPosition(viewportPosition, highlighted_text);
  });

  const throttledOnTextSelection = React.useMemo(() => {
    return throttle(onTextSelection, 200, { leading: true, trailing: true });
  }, [onTextSelection]);

  const onTextSelectionChange = useLatestCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const curRange = selection.getRangeAt(0);
    if (!curRange) return;
    setIsSelecting(true);
    const textLayer = getElementFromRange(curRange, 'textLayer');
    if (textLayer) {
      // We temporarily move the text layer above everything else. This won't work for cross-page highlight
      selectionTextLayerRef.current = textLayer;
      textLayer.style.zIndex = '5';
    }
    throttledOnTextSelection(curRange);
  });

  const renderTipAtPosition = (position: T_Position, highlighted_text: T_NewHighlight['highlighted_text']) => {
    const { boundingRect, pageNumber } = position;
    const page = { node: viewer.current.getPageView(pageNumber - 1).div };
    const scaledPosition = viewportPositionToScaled(viewer, position);

    const size = {
      left: page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
      top: boundingRect.top + page.node.offsetTop,
      bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
    };
    setTempHighlight({ position: scaledPosition, highlighted_text, size });
  };

  const renderHighlights = useLatestCallback((pageNumber: number) => {
    const existingPageHighlights: T_Highlight[] = [];
    for (const h of highlights) {
      if (isDirectHighlight(h) && h.position.pageNumber === pageNumber) existingPageHighlights.push(h);
    }
    const pageHighlights =
      !isSelecting && tempHighlight && tempHighlight.position.pageNumber === pageNumber
        ? [...existingPageHighlights, tempHighlight]
        : existingPageHighlights;

    if (!pdfDocument) return;
    const highlightLayer = findOrCreateLayer(viewer, pageNumber, 'page-highlights');
    if (highlightLayer) {
      ReactDom.render(
        <PageHighlights
          viewer={viewer}
          pageNumber={pageNumber}
          onHighlightClick={() => {}}
          highlights={pageHighlights}
        />,
        highlightLayer,
      );
    }
  });

  useJumpToHandler(viewer);

  const onTextLayerRendered = useLatestCallback(({ pageNumber }: { pageNumber: number }) => {
    renderHighlights(pageNumber);
    renderCitations(pageNumber);
    pagesReadyToRender.current.push(pageNumber);
  });

  React.useEffect(() => {}, []);

  const onMouseDown = (event: React.MouseEvent) => {
    clearTempHighlight();
  };

  const onMouseUp = (event: React.MouseEvent) => {
    setIsSelecting(false);
    if (selectionTextLayerRef.current) {
      // Remove the zIndex value
      selectionTextLayerRef.current.style.zIndex = '';
      selectionTextLayerRef.current = null;
    }
  };

  const zoom = (sign: number) => {
    if (zoomTimeout.current) return;
    viewer.current.currentScale = viewer.current.currentScale + sign * 0.05;
    zoomTimeout.current = window.setTimeout(() => {
      // This hack helps us ensure the the user doesn't zoom in/out too fast
      clearTimeout(zoomTimeout.current);
      zoomTimeout.current = undefined;
    }, 200);
  };

  React.useEffect(() => {
    return () => {
      clearTimeout(zoomTimeout.current);
    };
  });

  React.useEffect(() => {
    // Update scroll progress. (Based on - https://stackoverflow.com/a/8028584/5737533)
    const onScroll = () => {
      const docElem = document.documentElement;
      const docBody = document.body;
      const scrollTop = docElem.scrollTop || docBody.scrollTop;
      const scrollHeight = docElem.scrollHeight || docBody.scrollHeight;
      const percent = (scrollTop / (scrollHeight - docElem.clientHeight)) * 100;
      updateReadingProgress(percent);
    };
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [updateReadingProgress]);

  React.useEffect(() => {
    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });

    const findController = new PDFFindController({ linkService, eventBus });

    viewer.current = new PDFViewer({
      container: containerNode.current,
      eventBus,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService,
      findController,
      textLayerMode: 2,
    });

    viewer.current.setDocument(pdfDocument);
    linkService.setDocument(pdfDocument);
    linkService.setViewer(viewer.current);
    eventBus.on('pagesinit', onDocumentReady);
    eventBus.on('textlayerrendered', onTextLayerRendered);
    document.addEventListener('selectionchange', onTextSelectionChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      eventBus.off('pagesinit', onDocumentReady);
      eventBus.off('textlayerrendered', onTextLayerRendered);
      document.removeEventListener('selectionchange', onTextSelectionChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, onDocumentReady, onTextLayerRendered, onTextSelectionChange, pdfDocument, viewer]);

  React.useEffect(() => {
    // Render all of the pages that are ready on every change of highlights
    if (!isDocumentReady) return;
    for (const pageNumber of pagesReadyToRender.current) {
      renderHighlights(pageNumber);
    }
  }, [isDocumentReady, highlights, renderHighlights]);

  React.useEffect(() => {
    if (tempHighlight && !isSelecting) {
      // Render when selection is done
      lastTempHighlightPage.current = tempHighlight.position.pageNumber;
      renderHighlights(tempHighlight.position.pageNumber);
    } else if (!tempHighlight && lastTempHighlightPage.current !== undefined) {
      // Render when temp highlight is cleared
      renderHighlights(lastTempHighlightPage.current);
    }
  }, [tempHighlight, isSelecting, renderHighlights]);

  return (
    <React.Fragment>
      <div className={styles.zoomWrapper}>
        <ZoomButton direction="in" onClick={() => zoom(1)} />
        <Spacer size={8} />
        <ZoomButton direction="out" onClick={() => zoom(-1)} />
      </div>
      <div
        ref={containerNode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={styles.pdfHighlighter}
        onContextMenu={e => e.preventDefault()}
        // onClick={onReferenceEnter}
        onMouseOver={onMouseMove}
      >
        <div id="pdfViewer" className={cx(styles.pdfViewer, 'pdfViewer')} />
        <NewHighlightContainer />
      </div>
      <ReferencesPopupManager activeReference={activeReference} clearReference={() => setActiveReference(undefined)} />
    </React.Fragment>
  );
};

export default PdfAnnotator;
