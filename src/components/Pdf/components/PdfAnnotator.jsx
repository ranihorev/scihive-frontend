/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import Pointable from 'react-pointable';
import { PDFViewer, PDFLinkService, PDFFindController } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import Fab from '@material-ui/core/Fab';
import { connect, Provider } from 'react-redux';
import getBoundingRect from '../lib/get-bounding-rect';
import getClientRects from '../lib/get-client-rects';
import getAreaAsPng from '../lib/get-area-as-png';
import {debounce} from 'lodash';

import '../style/pdf_viewer.css';
import '../style/PdfHighlighter.css';

import {
  getPageFromRange,
  getPageFromElement,
  findOrCreateContainerLayer
} from '../lib/pdfjs-dom';

import TipContainer from './TipContainer';
import MouseSelection from './MouseSelection';

import { scaledToViewport, viewportToScaled } from '../lib/coordinates';

import { store } from '../../../store';
import { APP_BAR_HEIGHT } from '../../TopBar/PrimaryAppBar';
import { actions } from '../../../actions';
import { convertMatches, renderMatches } from '../lib/convertMatches';

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

const PdfAnnotator = (
  { 
    pdfDocument, 
    scrollRef, 
    isVertical, 
    enableAreaSelection, 
    onReferenceEnter, 
    onReferenceLeave, 
    highlightTransform, 
    highlights, 
    onSelectionFinished, 
  }) => {
  const [ghostHighlight, setGhostHighlight] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [range, setRange] = React.useState(null);
  const [tip, setTip] = React.useState(null);
  const [scrolledToHighlightId, setScrolledToHighlightId] = React.useState(EMPTY_ID);
  const [isAreaSelectionInProgress, setIsAreaSelectionInProgress] = React.useState(false);
  const [isDocumentReady, setIsDocumentReady] = React.useState(false);
  const [isTextLayerReady, setIsTextLayerReady] = React.useState(false);

  const viewer = React.useRef(null);
  const linkService = React.useRef(null);
  const containerNode = React.useRef(null);
  
  React.useEffect(() => {

    linkService.current = new PDFLinkService();
    
    const pdfFindController = new PDFFindController({
      linkService: linkService.current
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

  const handleKeyDown = (event) => {
    if (event.code === 'Escape') {
      hideTipAndSelection();
    }
  };

  React.useEffect(() => {
    if (!isDocumentReady || !isTextLayerReady) return;
    renderHighlights();
  }, [isDocumentReady, isTextLayerReady, ghostHighlight, isCollapsed, scrolledToHighlightId])
  
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
  
  const resetHash = () => {
    window.location.hash = '';
  };

  const scrollTo = (highlight, otherLocation) => {
    if (otherLocation) {
      viewer.current.scrollPageIntoView({
        pageNumber: otherLocation.page,
        destArray: [null, { name: 'XYZ' }, 0, otherLocation.pos]
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
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin
        ),
        0
      ]
    });
    setScrolledToHighlightId(highlight.id);
    // wait for scrolling to finish
    setTimeout(() => {
      viewer.current.container.addEventListener('scroll', onScroll);
    }, 100);
  };

  const onScroll = () => {
    resetHash();
    setScrolledToHighlightId(EMPTY_ID);
    viewer.current.container.removeEventListener('scroll', onScroll);
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

  const debouncedUpdateSelection = debounce((range) => {
    setIsCollapsed(false);
    setRange(range);
  }, 50);

  const onSelectionChange = () => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      setIsCollapsed(true);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!range) return;
    debouncedUpdateSelection(range);
  };

  React.useEffect(() => {
    afterSelection();
  }, [isCollapsed, range])

  const afterSelection = () => {
    if (!range || isCollapsed) return;
    const page = getPageFromRange(range);
    if (!page) return;
  
    const rects = getClientRects(range, page.node);
    if (rects.length === 0) return;

    const boundingRect = getBoundingRect(rects);
    
    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const content = {
      text: range.toString()
    };
    const scaledPosition = viewportPositionToScaled(viewportPosition);
    renderTipAtPosition(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => hideTipAndSelection(),
        () => setGhostHighlight({ position: scaledPosition })
      )
    );
  };

  const viewportPositionToScaled = ({
    pageNumber,
    boundingRect,
    rects
  }) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber
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
            left:
              page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + page.node.offsetTop,
            bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
          }}
          children={inner}
        />
      </Provider>,
      tipNode
    );
  }

  const groupHighlightsByPage = () => {
    return [...highlights, ghostHighlight]
      .filter(Boolean)
      .reduce((res, highlight) => {
        const { pageNumber } = highlight.position;

        res[pageNumber] = res[pageNumber] || [];
        res[pageNumber].push(highlight);

        return res;
      }, {});
  };

  const scaledPositionToViewport = ({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates
  }) => {
    const { viewport } = viewer.current.getPageView(pageNumber - 1);

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber
    };
  }

  const findOrCreateHighlightLayer = (page: number) => {
    const { textLayer } = viewer.current.getPageView(page - 1);
    if (!textLayer) return null;
    return findOrCreateContainerLayer(textLayer.textLayerDiv, 'PdfHighlighter__highlight-layer');
  }

  const showTip = (highlight, content) => {
    const highlightInProgress = !isCollapsed || ghostHighlight;
    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }
    renderTipAtPosition(highlight.position, content);
  }

  const renderHighlights = () => {
    const highlightsByPage = groupHighlightsByPage(highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        ReactDom.render(
          <div>
            {(highlightsByPage[pageNumber] || []).map(
              (highlight, index) => {
                const { position, ...rest } = highlight;

                const viewportHighlight = {
                  position: scaledPositionToViewport(position),
                  ...rest
                };

                if (tip && tip.highlight.id === String(highlight.id)) {
                  showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = scrolledToHighlightId === highlight.id;

                return highlightTransform(
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    setTip({ highlight, callback })
                    showTip(highlight, callback(highlight));
                  },
                  hideTipAndSelection,
                  rect => {
                    const { viewport } = viewer.current.getPageView(
                      pageNumber - 1
                    );

                    return viewportToScaled(rect, viewport);
                  },
                  boundingRect => screenshot(boundingRect, pageNumber),
                  isScrolledTo
                );
              }
            )}
          </div>,
          highlightLayer
        );
      }
    }
  }
  
  const onTextLayerRendered = () => {
    setIsTextLayerReady(true);
  };

  const containerStyle = isVertical
    ? { height: '100%', width: '100vw' }
    : { height: `calc(100vh - ${APP_BAR_HEIGHT}px)` };

  const onMouseDown = (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest('.PdfHighlighter__tip-container')) return;
    hideTipAndSelection();
  };

  const toggleTextSelection = (flag) => {
    viewer.current.viewer.classList.toggle('PdfHighlighter--disable-selection', flag);
  }

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
        {/* <ZoomButtom direction="in" onClick={() => this.zoom(1)} />
        <ZoomButtom direction="out" onClick={() => this.zoom(-1)} /> */}
      </div>
      <Pointable onPointerDown={onMouseDown}>
        <div
          ref={containerNode}
          className="PdfHighlighter"
          onContextMenu={e => e.preventDefault()}
          onScroll={() => {}}
          style={containerStyle}
          onClick={e => {
            if (
              e.target.tagName === 'A' &&
              e.target.getAttribute('href').includes('#cite')
            ) {
              onReferenceEnter(e);
            }
          }}
          onMouseOver={e => {
            if (
              e.target.tagName === 'A' &&
              e.target.getAttribute('href').includes('#cite')
            ) {
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
    highlights: state.paper.highlights
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateReadingProgress: pos => {
      dispatch(actions.updateReadingProgress(pos));
    }
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default withRedux(PdfAnnotator);