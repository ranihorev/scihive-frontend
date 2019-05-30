/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React from 'react';
import ReactDom from 'react-dom';
import Pointable from 'react-pointable';
import { PDFViewer, PDFLinkService, PDFFindController } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import Fab from '@material-ui/core/Fab';
import { connect, Provider } from 'react-redux';
import { isEmpty, debounce, cloneDeep } from 'lodash';
import getBoundingRect from '../lib/get-bounding-rect';
import getClientRects from '../lib/get-client-rects';
import getAreaAsPng from '../lib/get-area-as-png';

import '../style/pdf_viewer.css';
import '../style/PdfHighlighter.css';

import { getPageFromRange, findOrCreateContainerLayer } from '../lib/pdfjs-dom';

import TipContainer from './TipContainer';
import MouseSelection from './MouseSelection';

import { scaledToViewport, viewportToScaled } from '../lib/coordinates';

import { store } from '../../../store';
import { APP_BAR_HEIGHT } from '../../TopBar/PrimaryAppBar';
import { actions } from '../../../actions';
import { convertMatches, renderMatches } from '../lib/pdfSearchUtils';

const EMPTY_ID = 'empty-id';

const zoomButtonCss = css`
  color: black;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const ZoomButtom = ({ direction, onClick }) => (
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

const PdfAnnotator = ({
  pdfDocument,
  scrollRef,
  isVertical,
  enableAreaSelection,
  onReferenceEnter,
  onReferenceLeave,
  highlightTransform,
  highlights,
  acronyms,
  onSelectionFinished,
  updateReadingProgress,
}) => {
  const [ghostHighlight, setGhostHighlight] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [range, setRange] = React.useState(null);
  const [tip, setTip] = React.useState(null);
  const [scrolledToHighlightId, setScrolledToHighlightId] = React.useState(EMPTY_ID);
  const [isAreaSelectionInProgress, setIsAreaSelectionInProgress] = React.useState(false);
  const [isDocumentReady, setIsDocumentReady] = React.useState(false);
  const [currTextLayerPage, setCurrTextLayerPage] = React.useState(0);
  const [acronymPositions, setAcronymPositions] = React.useState({});

  const viewer = React.useRef(null);
  const linkService = React.useRef(null);
  const containerNode = React.useRef(null);

  const handleKeyDown = event => {
    if (event.code === 'Escape') {
      hideTipAndSelection();
    }
  };

  const resetHash = () => {
    window.location.hash = '';
  };

  const onScroll = () => {
    resetHash();
    setScrolledToHighlightId(EMPTY_ID);
    viewer.current.container.removeEventListener('scroll', onScroll);
  };

  const scrollTo = (highlight, otherLocation) => {
    if (otherLocation) {
      viewer.current.scrollPageIntoView({
        pageNumber: otherLocation.page,
        destArray: [null, { name: 'XYZ' }, 0, otherLocation.pos],
      });
      return;
    }

    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;
    viewer.current.container.removeEventListener('scroll', onScroll);

    const pageViewport = viewer.current.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    viewer.current.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: 'XYZ' },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top - scrollMargin,
        ),
        0,
      ],
    });
    setScrolledToHighlightId(highlight.id);
    // wait for scrolling to finish
    setTimeout(() => {
      viewer.current.container.addEventListener('scroll', onScroll);
    }, 100);
  };

  const onDocumentReady = () => {
    if (!containerNode.current) {
      console.error('Container node is not initialized');
      return;
    }
    const { viewport } = viewer.current.getPageView(0);
    viewer.current.currentScaleValue = containerNode.current.clientWidth / viewport.width - 0.05;
    setIsDocumentReady(true);
    scrollRef(scrollTo);
  };

  const hideTipAndSelection = () => {
    const tipNode = findOrCreateContainerLayer(viewer.current.viewer, 'PdfHighlighter__tip-layer');
    ReactDom.unmountComponentAtNode(tipNode);
    setGhostHighlight(null);
    setTip(null);
  };

  const screenshot = (position, pageNumber) => {
    const { canvas } = viewer.current.getPageView(pageNumber - 1);
    return getAreaAsPng(canvas, position);
  };

  const debouncedUpdateSelection = debounce(newRange => {
    setIsCollapsed(false);
    setRange(newRange);
  }, 50);

  const onSelectionChange = () => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      setIsCollapsed(true);
      return;
    }
    const curRange = selection.getRangeAt(0);
    if (!curRange) return;
    debouncedUpdateSelection(curRange);
  };

  const viewportPositionToScaled = ({ pageNumber, boundingRect, rects }) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  };

  const renderTipAtPosition = (position, inner) => {
    const { boundingRect, pageNumber } = position;
    const page = { node: viewer.current.getPageView(pageNumber - 1).div };
    const pageBoundingRect = page.node.getBoundingClientRect();
    const tipNode = findOrCreateContainerLayer(viewer.current.viewer, 'PdfHighlighter__tip-layer');

    ReactDom.render(
      <Provider store={store}>
        <TipContainer
          scrollTop={viewer.current.container.scrollTop}
          pageBoundingRect={pageBoundingRect}
          style={{
            left: page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + page.node.offsetTop,
            bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
          }}
          children={inner}
        />
      </Provider>,
      tipNode,
    );
  };

  const afterSelection = () => {
    if (!range || isCollapsed) return;
    const page = getPageFromRange(range);
    if (!page) return;

    const rects = getClientRects(range, page.node);
    if (rects.length === 0) return;

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const content = {
      text: range.toString(),
    };
    const scaledPosition = viewportPositionToScaled(viewportPosition);
    renderTipAtPosition(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => hideTipAndSelection(),
        () => setGhostHighlight({ position: scaledPosition }),
      ),
    );
  };

  const groupHighlightsByPage = () => {
    return [...highlights, ghostHighlight].filter(Boolean).reduce((res, highlight) => {
      const { pageNumber } = highlight.position;

      res[pageNumber] = res[pageNumber] || [];
      res[pageNumber].push(highlight);

      return res;
    }, {});
  };

  const scaledPositionToViewport = ({ pageNumber, boundingRect, rects, usePdfCoordinates }) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect => scaledToViewport(rect, viewport, usePdfCoordinates)),
      pageNumber,
    };
  };

  const findOrCreateHighlightLayer = (page: number) => {
    const { textLayer } = viewer.current.getPageView(page - 1);
    if (!textLayer) return null;
    return findOrCreateContainerLayer(textLayer.textLayerDiv, 'PdfHighlighter__highlight-layer');
  };

  const showTip = (highlight, content) => {
    const highlightInProgress = !isCollapsed || ghostHighlight;
    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }
    renderTipAtPosition(highlight.position, content);
  };

  const renderHighlights = () => {
    const highlightsByPage = groupHighlightsByPage(highlights);
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = findOrCreateHighlightLayer(pageNumber);
      if (highlightLayer) {
        ReactDom.render(
          <div>
            {(highlightsByPage[pageNumber] || []).map((highlight, index) => {
              const { position, ...rest } = highlight;

              const viewportHighlight = {
                position: scaledPositionToViewport(position),
                ...rest,
              };

              if (tip && tip.highlight && tip.highlight.id === String(highlight.id)) {
                showTip(tip.highlight, tip.callback(viewportHighlight));
              }

              const isScrolledTo = scrolledToHighlightId === highlight.id;

              return highlightTransform(
                viewportHighlight,
                index,
                (curHighlight, callback) => {
                  setTip({ curHighlight, callback });
                  showTip(curHighlight, callback(curHighlight));
                },
                hideTipAndSelection,
                rect => {
                  const { viewport } = viewer.current.getPageView(pageNumber - 1);

                  return viewportToScaled(rect, viewport);
                },
                boundingRect => screenshot(boundingRect, pageNumber),
                isScrolledTo,
              );
            })}
          </div>,
          highlightLayer,
        );
      }
    }
  };

  const onTextLayerRendered = event => {
    setCurrTextLayerPage(event.detail.pageNumber);
  };

  const containerStyle = isVertical
    ? { height: '100%', width: '100vw' }
    : { height: `calc(100vh - ${APP_BAR_HEIGHT}px)` };

  const onMouseDown = event => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest('.PdfHighlighter__tip-container')) return;
    hideTipAndSelection();
  };

  const toggleTextSelection = flag => {
    viewer.current.viewer.classList.toggle('PdfHighlighter--disable-selection', flag);
  };

  const onViewerScroll = () => {
    const { viewer: viewerInner, container } = viewer.current;
    const maxYpos = Math.max(0, viewerInner.clientHeight - container.clientHeight);
    const progress = Math.min(1, container.scrollTop / maxYpos) * 100;
    updateReadingProgress(progress);
  };

  const zoom = sign => {
    viewer.current.currentScaleValue = parseFloat(viewer.current.currentScaleValue) + sign * 0.05;
  };

  React.useEffect(() => {
    afterSelection();
  }, [isCollapsed, range]);

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

    if (containerNode.current) {
      containerNode.current.addEventListener('pagesinit', onDocumentReady);
      containerNode.current.addEventListener('textlayerrendered', onTextLayerRendered);
    }
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (containerNode.current) {
        containerNode.current.removeEventListener('pagesinit', onDocumentReady);
        containerNode.current.removeEventListener('textlayerrendered', onTextLayerRendered);
      }
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    // Find acronyms in the pdf
    if (!isDocumentReady || isEmpty(acronyms)) return;
    const { findController } = viewer.current;
    // We are accessing private functions of findController. Not ideal...
    findController._firstPageCapability.promise.then(async () => {
      findController._extractText();
      const tempAcronymsPos = {};
      for (const acronym of Object.keys(acronyms)) {
        findController._state = {
          query: acronym,
          caseSensitive: true,
          highlightAll: false,
          entireWord: false,
        };
        for (let i = 0; i < pdfDocument.numPages; i++) {
          findController._pendingFindMatches[i] = true;
          findController._extractTextPromises[i].then(pageIdx => {
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
  }, [isDocumentReady, acronyms]);

  React.useEffect(() => {
    if (!isDocumentReady || currTextLayerPage === 0 || isEmpty(acronymPositions)) return;
    const pageIdx = currTextLayerPage - 1;
    const { textLayer } = viewer.current.getPageView(pageIdx);
    Object.keys(acronymPositions).forEach(acronym => {
      const m = convertMatches(acronym.length, acronymPositions[acronym][pageIdx], textLayer);
      renderMatches(m, 0, textLayer, acronyms[acronym]);
    });
  }, [isDocumentReady, currTextLayerPage, acronymPositions]);

  React.useEffect(() => {
    if (!isDocumentReady || currTextLayerPage === 0) return;
    renderHighlights();
  }, [isDocumentReady, currTextLayerPage, ghostHighlight, isCollapsed, scrolledToHighlightId]);

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
        <ZoomButtom direction="in" onClick={() => zoom(1)} />
        <ZoomButtom direction="out" onClick={() => zoom(-1)} />
      </div>
      <Pointable onPointerDown={onMouseDown}>
        <div
          ref={containerNode}
          className="PdfHighlighter"
          onScroll={onViewerScroll}
          onContextMenu={e => e.preventDefault()}
          style={containerStyle}
          onClick={e => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href').includes('#cite')) {
              onReferenceEnter(e);
            }
          }}
          onMouseOver={e => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href').includes('#cite')) {
              onReferenceEnter(e);
            } else {
              onReferenceLeave();
            }
          }}
        >
          <div className="pdfViewer" />
          {typeof enableAreaSelection === 'function' ? (
            <MouseSelection
              onDragStart={() => toggleTextSelection(true)}
              onDragEnd={() => toggleTextSelection(false)}
              onChange={isVisible => {
                if (isVisible !== isAreaSelectionInProgress) {
                  setIsAreaSelectionInProgress(isVisible);
                }
              }}
              shouldStart={event =>
                enableAreaSelection(event) &&
                event.target instanceof HTMLElement &&
                Boolean(event.target.closest('.page'))
              }
              onSelection={() => {}}
            />
          ) : null}
        </div>
      </Pointable>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    highlights: state.paper.highlights,
    acronyms: state.paper.acronyms,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateReadingProgress: pos => {
      dispatch(actions.updateReadingProgress(pos));
    },
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(PdfAnnotator);
