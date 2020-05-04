/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Fab from '@material-ui/core/Fab';
import { cloneDeep, debounce, isEmpty, pick } from 'lodash';
import { PDFDocumentProxy } from 'pdfjs-dist';
// @ts-ignore
import { PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import React from 'react';
import { isMobile } from 'react-device-detect';
import ReactDom from 'react-dom';
import shallow from 'zustand/shallow';
import {
  AcronymPositions,
  isDirectHighlight,
  T_Highlight,
  T_LTWH,
  T_NewHighlight,
  T_Position,
  T_ScaledPosition,
} from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { activateOnboarding } from '../../../utils/hooks';
import { useLatestCallback } from '../../../utils/useLatestCallback';
import { ReferencesPopoverState } from '../../ReferencesProvider';
import { APP_BAR_HEIGHT } from '../../TopBar/PrimaryAppBar';
import { scaledToViewport, viewportToScaled } from '../lib/coordinates';
import getAreaAsPng from '../lib/get-area-as-png';
import getBoundingRect from '../lib/get-bounding-rect';
import getClientRects from '../lib/get-client-rects';
import {
  findOrCreateContainerLayer,
  getElementFromRange,
  getPageFromElement,
  getPageFromRange,
} from '../lib/pdfjs-dom';
import { convertMatches, renderMatches } from '../lib/pdfSearchUtils';
import '../style/PdfHighlighter.css';
import MouseSelection from './MouseSelection';
import { PageHighlights } from './PageHighlights';
import { TipContainer } from './TipContainer';
import { useJumpToHandler } from './useJumpToHandler';
import { useCookies } from 'react-cookie';

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

const pdfViewerCss = css`
  .textLayer ::selection {
    background: rgb(255, 172, 0);
    opacity: 1;
    mix-blend-mode: multiply;
  }
  .page-highlights {
    z-index: 2;
    opacity: 1;
    mix-blend-mode: multiply;
  }

  .annotationLayer {
    position: absolute;
    top: 0;
    z-index: 3;
  }

  /* Microsoft Edge Browser 12+ (All) - @supports method */
  @supports (-ms-ime-align: auto) {
    .page-highlights {
      opacity: 0.5;
    }
  }

  .page {
    box-shadow: 0 0 0 0.75pt #d1d1d1, 0 0 3pt 0.75pt #ccc;
  }
`;

interface PdfAnnotatorProps {
  enableAreaSelection?: (event: MouseEvent) => boolean;
  setReferencePopoverState?: (props: ReferencesPopoverState) => void;
  pdfDocument: PDFDocumentProxy;
}

const ONBOARDING_COOKIE = 'onboarding_cookie';

const PdfAnnotator: React.FC<PdfAnnotatorProps> = ({ enableAreaSelection, setReferencePopoverState, pdfDocument }) => {
  // const [scrolledToHighlightId, setScrolledToHighlightId] = React.useState(EMPTY_ID);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const lastTempHighlightPage = React.useRef<number | undefined>();
  const selectionTextLayerRef = React.useRef<HTMLElement | null>(null);
  const [isDocumentReady, setIsDocumentReady] = React.useState(false);
  const pagesReadyToRender = React.useRef<number[]>([]);
  const [acronymPositions, setAcronymPositions] = React.useState<AcronymPositions>({});
  const canZoom = React.useRef(true);
  const [cookies, setCookie] = useCookies([]);
  const isOnboarding = React.useRef(false);
  const onboardingTeardown = React.useRef<() => void>();

  const {
    references,
    paperJumpData,
    highlights,
    jumpToComment,
    updateReadingProgress,
    acronyms,
    clearTempHighlight,
    tempHighlight,
    setTempHighlight,
  } = usePaperStore(
    state => ({
      ...pick(state, [
        'references',
        'clearPaperJumpTo',
        'paperJumpData',
        'highlights',
        'updateReadingProgress',
        'acronyms',
        'setTempHighlight',
        'tempHighlight',
        'clearTempHighlight',
      ]),
      jumpToComment: (id: string) => {
        state.setSidebarTab('Comments');
        state.setSidebarJumpTo({ area: 'sidebar', type: 'comment', id });
      },
    }),
    shallow,
  );

  const viewer = React.useRef<PDFViewer>(null);
  const linkService = React.useRef<PDFLinkService>(null);
  const containerNode = React.useRef<HTMLDivElement>(null);
  const highlightLayerNode = React.useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      clearTempHighlight();
    }
  };

  const onDocumentReady = () => {
    if (!containerNode.current) {
      console.error('Container node is not initialized');
      return;
    }
    const { viewport } = viewer.current.getPageView(0);
    viewer.current.currentScaleValue = containerNode.current.clientWidth / viewport.width - 0.05;
    setIsDocumentReady(true);
  };

  const screenshot = (position: T_LTWH, pageNumber: number) => {
    const { canvas } = viewer.current.getPageView(pageNumber - 1);
    return getAreaAsPng(canvas, position);
  };

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

  const onTextSelectionChange = () => {
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
  };

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

  const renderHighlights = (pageNumber: number) => {
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
          onHighlightClick={jumpToComment}
          highlights={pageHighlights}
          screenshot={(boundingRect: T_LTWH) => screenshot(boundingRect, pageNumber)}
          scaledPositionToViewport={scaledPositionToViewport}
          jumpData={paperJumpData}
        />,
        highlightLayer,
      );
    }
  };
  useJumpToHandler({ viewer, renderHighlights });

  const renderAcronyms = (pageNumber: number) => {
    const { textLayer } = viewer.current.getPageView(pageNumber - 1);
    for (const acronym of Object.keys(acronymPositions)) {
      const m = convertMatches(acronym.length, acronymPositions[acronym][pageNumber - 1], textLayer);
      renderMatches(m, 0, textLayer, acronyms[acronym]);
    }
  };

  const onTextLayerRendered = useLatestCallback(
    (event: CustomEvent<{ pageNumber: number }>) => {
      // TODO: clear previous timeout and remove timeout on unmount
      setTimeout(() => {
        // This hack helps us ensure the the user doesn't zoom in/out too fast
        canZoom.current = true;
      }, 200);
      const { pageNumber } = event.detail;
      renderHighlights(pageNumber);
      renderAcronyms(pageNumber);
      pagesReadyToRender.current.push(pageNumber);
      const { textLayer } = viewer.current.getPageView(pageNumber - 1);
      if (pageNumber - 1 === 0 && !cookies[ONBOARDING_COOKIE]) {
        onboardingTeardown.current = activateOnboarding(textLayer);
        isOnboarding.current = true;
        setCookie(ONBOARDING_COOKIE, { domain: '.scihive.org', sameSite: true, path: '/' });
      }
    },
    [acronymPositions, highlights, tempHighlight, isSelecting],
  );

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

  const toggleTextSelection = (flag: boolean) => {
    viewer.current.viewer.classList.toggle('PdfHighlighter--disable-selection', flag);
  };

  const onViewerScroll = () => {
    const { viewer: viewerInner, container } = viewer.current;
    const maxYpos = Math.max(0, viewerInner.clientHeight - container.clientHeight);
    const progress = Math.min(1, container.scrollTop / maxYpos) * 100;
    updateReadingProgress(progress);
  };

  const zoom = (sign: number) => {
    if (canZoom.current) {
      viewer.current.currentScaleValue = parseFloat(viewer.current.currentScaleValue) + sign * 0.05;
    }
    canZoom.current = false;
  };

  const onReferenceEnter = React.useCallback(
    (e: React.MouseEvent) => {
      if (isSelecting) return; // Don't open popup when selecting text
      const target = e.target as HTMLElement;
      if (!target) return;
      const href = target.getAttribute('href') || '';
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
    },
    [setReferencePopoverState, references, isSelecting],
  );

  React.useEffect(() => {
    linkService.current = new PDFLinkService();

    const pdfFindController = new PDFFindController({
      linkService: linkService.current,
    });

    viewer.current = new PDFViewer({
      container: containerNode.current,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: linkService.current,
      findController: pdfFindController,
    });

    viewer.current.setDocument(pdfDocument);
    linkService.current.setDocument(pdfDocument);
    linkService.current.setViewer(viewer.current);
  }, [pdfDocument]);

  React.useEffect(() => {
    document.addEventListener('pagesinit', onDocumentReady);
    document.addEventListener('textlayerrendered', onTextLayerRendered as EventListener);
    document.addEventListener('selectionchange', onTextSelectionChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pagesinit', onDocumentReady);
      document.removeEventListener('textlayerrendered', onTextLayerRendered as EventListener);
      document.removeEventListener('selectionchange', onTextSelectionChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    // Render all of the pages that are ready on every change of highlights
    if (!isDocumentReady) return;
    for (const pageNumber of pagesReadyToRender.current) {
      renderHighlights(pageNumber);
    }
  }, [isDocumentReady, highlights]);

  React.useEffect(() => {
    if (tempHighlight && !isSelecting) {
      // Render when selection is done
      lastTempHighlightPage.current = tempHighlight.position.pageNumber;
      renderHighlights(tempHighlight.position.pageNumber);
    } else if (!tempHighlight && lastTempHighlightPage.current !== undefined) {
      // Render when temp highlight is cleared
      renderHighlights(lastTempHighlightPage.current);
    }
  }, [tempHighlight, isSelecting]);

  React.useEffect(() => {
    if (!isDocumentReady) return;
    for (const pageNumber of pagesReadyToRender.current) {
      renderAcronyms(pageNumber);
    }
  }, [isDocumentReady, acronymPositions]);

  React.useEffect(() => {
    // Find acronyms in the pdf
    if (!pdfDocument || !isDocumentReady || isEmpty(acronyms)) return;
    const { findController } = viewer.current;
    // We are accessing private functions of findController. Not ideal...
    findController._firstPageCapability.promise.then(async () => {
      findController._extractText();
      const tempAcronymsPos: AcronymPositions = {};
      for (const acronym of Object.keys(acronyms)) {
        findController._state = {
          query: acronym,
          caseSensitive: true,
          highlightAll: false,
          entireWord: true,
        };
        for (let i = 0; i < pdfDocument.numPages; i++) {
          findController._pendingFindMatches[i] = true;
          findController._extractTextPromises[i].then((pageIdx: number) => {
            delete findController._pendingFindMatches[pageIdx];
            findController._calculateMatch(pageIdx);
          });
        }
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(findController._extractTextPromises);
        tempAcronymsPos[acronym] = cloneDeep(findController.pageMatches);
      }
      setAcronymPositions(tempAcronymsPos);
    });
  }, [isDocumentReady, acronyms, pdfDocument]);

  return (
    <React.Fragment>
      <div
        css={css`
          position: absolute;
          bottom: 10px;
          right: 8px;
          z-index: 1000;
        `}
      >
        <ZoomButton direction="in" onClick={() => zoom(1)} />
        <ZoomButton direction="out" onClick={() => zoom(-1)} />
      </div>
      <div
        ref={containerNode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className="PdfHighlighter"
        onScroll={onViewerScroll}
        onContextMenu={e => e.preventDefault()}
        style={{ height: `calc(100vh - ${APP_BAR_HEIGHT}px)` }}
        onClick={onReferenceEnter}
        onMouseOver={onReferenceEnter}
        css={pdfViewerCss}
      >
        <div className="pdfViewer" />
        <TipContainer isOnboarding={isOnboarding.current} />
        <div ref={highlightLayerNode} />
      </div>
    </React.Fragment>
  );
};

export default PdfAnnotator;
