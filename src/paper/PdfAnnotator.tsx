/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Fab from '@material-ui/core/Fab';
import cx from 'classnames';
import { debounce, pick } from 'lodash';
import { PDFDocumentProxy } from 'pdfjs-dist';
// @ts-ignore
import { EventBus, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import React from 'react';
import { useCookies } from 'react-cookie';
import { isMobile } from 'react-device-detect';
import ReactDom from 'react-dom';
import shallow from 'zustand/shallow';
import {
  isDirectHighlight,
  PaperJump,
  References,
  T_Highlight,
  T_NewHighlight,
  T_Position,
  T_ScaledPosition,
} from '../models';
import { usePaperStore } from '../stores/paper';
import { createEvent } from '../utils';
import { Spacer } from '../utils/Spacer';
import { JUMP_TO_EVENT, useJumpToHandler } from '../utils/useJumpToHandler';
import { useLatestCallback } from '../utils/useLatestCallback';
import { NewHighlightContainer } from './highlights/NewHighlightContainer';
import { PageHighlights } from './highlights/PageHighlights';
import styles from './PdfAnnotator.module.scss';
import { scaledToViewport, viewportToScaled } from './pdfUtils/coordinates';
import getBoundingRect from './pdfUtils/get-bounding-rect';
import getClientRects from './pdfUtils/get-client-rects';
import { findOrCreateContainerLayer, getElementFromRange, getPageFromRange } from './pdfUtils/pdfjs-dom';
import { ReferencesPopoverState } from './ReferencesProvider';
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
  setReferencePopoverState?: (props: ReferencesPopoverState) => void;
  pdfDocument: PDFDocumentProxy;
  initialWidth?: number;
  viewer: React.MutableRefObject<PDFViewer>;
  references?: References;
}

const ONBOARDING_COOKIE = 'onboarding_cookie';

// TODO: improve typing here
const jumpToCite = async (doc: any, href: string) => {
  doc
    .getDestination(href.replace('#', ''))
    .then((citePos: any) =>
      doc.getPageIndex(citePos[0]).then((pageNumber: number) => {
        document.dispatchEvent(
          createEvent<PaperJump>(JUMP_TO_EVENT, {
            area: 'paper',
            type: 'section',
            id: href,
            location: { pageNumber: pageNumber + 1, position: citePos[3] },
          }),
        );
      }),
    )
    .catch((e: any) => console.warn(e));
};

const PdfAnnotator: React.FC<PdfAnnotatorProps> = ({
  setReferencePopoverState,
  pdfDocument,
  initialWidth,
  viewer,
  references = {},
}) => {
  const [isSelecting, setIsSelecting] = React.useState(false);
  const lastTempHighlightPage = React.useRef<number | undefined>();
  const selectionTextLayerRef = React.useRef<HTMLElement | null>(null);
  const pagesReadyToRender = React.useRef<number[]>([]);
  const canZoom = React.useRef(true);
  const [cookies, setCookie] = useCookies([]);
  const isOnboarding = React.useRef(false);
  const onboardingTeardown = React.useRef<() => void>();

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

  const containerNode = React.useRef<HTMLDivElement>(null);
  const highlightLayerNode = React.useRef<HTMLDivElement>(null);

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

  const debouncedOnTextSelection = debounce(newRange => {
    const page = getPageFromRange(newRange);
    if (!page) return;
    const rects = getClientRects(newRange, page.node);
    if (rects.length === 0) return;

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const highlighted_text: T_NewHighlight['highlighted_text'] = newRange.toString();
    renderTipAtPosition(viewportPosition, highlighted_text);
  }, 30);

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
    debouncedOnTextSelection(curRange);
  });

  const viewportPositionToScaled = ({ pageNumber, boundingRect, rects }: T_Position) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  };

  const renderTipAtPosition = (position: T_Position, highlighted_text: T_NewHighlight['highlighted_text']) => {
    const { boundingRect, pageNumber } = position;
    const page = { node: viewer.current.getPageView(pageNumber - 1).div };
    const scaledPosition = viewportPositionToScaled(position);

    const size = {
      left: page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
      top: boundingRect.top + page.node.offsetTop,
      bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
    };
    setTempHighlight({ position: scaledPosition, highlighted_text, size });
  };

  const scaledPositionToViewport = ({ pageNumber, boundingRect, rects, usePdfCoordinates }: T_ScaledPosition) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect => scaledToViewport(rect, viewport, usePdfCoordinates)),
      pageNumber,
    };
  };

  const findOrCreateHighlightLayer = (page: number) => {
    const { annotationLayer } = viewer.current.getPageView(page - 1);
    if (!annotationLayer) return null;
    return findOrCreateContainerLayer(annotationLayer.pageDiv, 'page-highlights');
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
    const highlightLayer = findOrCreateHighlightLayer(pageNumber);
    if (highlightLayer) {
      ReactDom.render(
        <PageHighlights
          pageNumber={pageNumber}
          onHighlightClick={() => {}}
          highlights={pageHighlights}
          scaledPositionToViewport={scaledPositionToViewport}
        />,
        highlightLayer,
      );
    }
  });

  useJumpToHandler(viewer);

  const onTextLayerRendered = useLatestCallback(({ pageNumber }: { pageNumber: number }) => {
    // TODO: clear previous timeout and remove timeout on unmount
    setTimeout(() => {
      // This hack helps us ensure the the user doesn't zoom in/out too fast
      canZoom.current = true;
    }, 200);

    renderHighlights(pageNumber);
    pagesReadyToRender.current.push(pageNumber);
    // const { textLayer } = viewer.current.getPageView(pageNumber - 1);
    if (pageNumber - 1 === 0 && !cookies[ONBOARDING_COOKIE]) {
      // onboardingTeardown.current = activateOnboarding(textLayer);
      isOnboarding.current = true;
      setCookie(ONBOARDING_COOKIE, { domain: '.scihive.org', sameSite: true, path: '/' });
    }
  });

  React.useEffect(() => {
    return onboardingTeardown.current?.();
  }, []);

  const onMouseDown = (event: React.MouseEvent) => {
    isOnboarding.current = false;
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
    if (canZoom.current) {
      viewer.current.currentScale = viewer.current.currentScale + sign * 0.05;
    }
    canZoom.current = false;
  };

  const onReferenceEnter = useLatestCallback((e: React.MouseEvent) => {
    if (isSelecting) return; // Don't open popup when selecting text
    const target = e.target as HTMLElement;
    if (!target) return;
    const href = target.getAttribute('href') || '';
    if (e.type === 'click' && !isMobile && target.tagName === 'A') {
      jumpToCite(pdfDocument, href);
    }
    if (!(target.tagName === 'A' && href.includes('#cite'))) return;

    const cite = decodeURIComponent(href.replace('#cite.', ''));
    if (references.hasOwnProperty(cite)) {
      if (isMobile) {
        target.onclick = event => {
          event.preventDefault();
        };
      }
      if (!setReferencePopoverState) return;
      if (e.type === 'click' && !isMobile) {
        setReferencePopoverState({ citeId: '' });
      } else {
        setReferencePopoverState({ anchor: target, citeId: cite });
      }
    }
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

    viewer.current = new PDFViewer({
      container: containerNode.current,
      eventBus,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService,
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
        onClick={onReferenceEnter}
        onMouseOver={onReferenceEnter}
      >
        <div id="pdfViewer" className={cx(styles.pdfViewer, 'pdfViewer')} />
        <NewHighlightContainer isOnboarding={isOnboarding.current} />
        <div ref={highlightLayerNode} />
      </div>
    </React.Fragment>
  );
};

export default PdfAnnotator;
