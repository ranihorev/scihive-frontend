// @flow
/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import Pointable from 'react-pointable';
import _ from 'lodash/fp';
import { PDFViewer, PDFLinkService } from 'pdfjs-dist/web/pdf_viewer';

import 'pdfjs-dist/web/pdf_viewer.css';
import '../style/pdf_viewer.css';

import '../style/PdfHighlighter.css';

import getBoundingRect from '../lib/get-bounding-rect';
import getClientRects from '../lib/get-client-rects';
import getAreaAsPng from '../lib/get-area-as-png';

import {
  getPageFromRange,
  getPageFromElement,
  findOrCreateContainerLayer
} from '../lib/pdfjs-dom';

import TipContainer from './TipContainer';
import MouseSelection from './MouseSelection';

import { scaledToViewport, viewportToScaled } from '../lib/coordinates';

import type {
  T_Position,
  T_ScaledPosition,
  T_Highlight,
  T_Scaled,
  T_LTWH,
  T_PDFJS_Viewer,
  T_PDFJS_Document,
  T_PDFJS_LinkService
} from '../types';
import { store } from '../../../store';
import { connect, Provider } from 'react-redux';
import { APP_BAR_HEIGHT } from '../../TopBar/PrimaryAppBar';
import { actions } from '../../../actions';
import Fab from '@material-ui/core/Fab';

type T_ViewportHighlight<T_HT> = { position: T_Position } & T_HT;

type State<T_HT> = {
  ghostHighlight: ?{
    position: T_ScaledPosition
  },
  isCollapsed: boolean,
  range: ?Range,
  tip: ?{
    highlight: T_ViewportHighlight<T_HT>,
    callback: (highlight: T_ViewportHighlight<T_HT>) => React$Element<*>
  },
  isAreaSelectionInProgress: boolean,
  scrolledToHighlightId: string
};

type Props<T_HT> = {
  highlightTransform: (
    highlight: T_ViewportHighlight<T_HT>,
    index: number,
    setTip: (
      highlight: T_ViewportHighlight<T_HT>,
      callback: (highlight: T_ViewportHighlight<T_HT>) => React$Element<*>
    ) => void,
    hideTip: () => void,
    viewportToScaled: (rect: T_LTWH) => T_Scaled,
    screenshot: (position: T_LTWH) => string,
    isScrolledTo: boolean
  ) => React$Element<*>,
  highlights: Array<T_HT>,
  onScrollChange: () => void,
  scrollRef: (scrollTo: (highlight: T_Highlight) => void) => void,
  pdfDocument: T_PDFJS_Document,
  onSelectionFinished: (
    position: T_ScaledPosition,
    content: { text?: string, image?: string },
    hideTipAndSelection: () => void,
    transformSelection: () => void
  ) => ?React$Element<*>,
  enableAreaSelection: (event: MouseEvent) => boolean,
  isVertical: boolean
};

const EMPTY_ID = 'empty-id';

const zoomButtonCss = css`
  color: black;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const ZoomButtom = ({direction, onClick}) => (
  <div>
    <Fab
      color="default"
      aria-label={direction === 'in' ? "zoom-in" : "zoom-out"}
      onClick={onClick}
      size="small"
      css={zoomButtonCss}
    >
      <i className={`fas fa-search-${direction === 'in' ? 'plus' : 'minus'}`} />
    </Fab>
  </div>
);

class PdfHighlighter<T_HT: T_Highlight> extends Component<
  Props<T_HT>,
  State<T_HT>
> {
  state = {
    ghostHighlight: null,
    isCollapsed: true,
    range: null,
    scrolledToHighlightId: EMPTY_ID
  };

  state: State<T_HT>;
  props: Props<T_HT>;

  viewer = null;
  viewer: T_PDFJS_Viewer;
  linkService: T_PDFJS_LinkService;

  containerNode = null;
  containerNode: ?HTMLDivElement;

  debouncedAfterSelection: () => void;

  componentWillReceiveProps(nextProps: Props<T_HT>) {
    if (this.props.highlights !== nextProps.highlights) {
      this.renderHighlights(nextProps);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    const { pdfDocument } = this.props;

    this.debouncedAfterSelection = _.debounce(100, this.afterSelection);
    this.linkService = new PDFLinkService();

    this.viewer = new PDFViewer({
      container: this.containerNode,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: this.linkService
    });

    this.viewer.setDocument(pdfDocument);
    this.linkService.setDocument(pdfDocument);
    this.linkService.setViewer(this.viewer);

    const width = this.viewer.container.clientWidth;
    // debug
    window.PdfViewer = this;

    document.addEventListener('selectionchange', this.onSelectionChange);
    document.addEventListener('keydown', this.handleKeyDown);

    this.containerNode &&
      this.containerNode.addEventListener('pagesinit', () => {
        this.onDocumentReady(width);
      });

    this.containerNode &&
      this.containerNode.addEventListener(
        'textlayerrendered',
        this.onTextLayerRendered
      );
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.onSelectionChange);
    document.removeEventListener('keydown', this.handleKeyDown);

    this.containerNode &&
      this.containerNode.removeEventListener(
        'textlayerrendered',
        this.onTextLayerRendered
      );
  }

  findOrCreateHighlightLayer(page: number) {
    const textLayer = this.viewer.getPageView(page - 1).textLayer;

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      'PdfHighlighter__highlight-layer'
    );
  }

  groupHighlightsByPage(
    highlights: Array<T_HT>
  ): { [pageNumber: string]: Array<T_HT> } {
    const { ghostHighlight } = this.state;

    return [...highlights, ghostHighlight]
      .filter(Boolean)
      .reduce((res, highlight) => {
        const { pageNumber } = highlight.position;

        res[pageNumber] = res[pageNumber] || [];
        res[pageNumber].push(highlight);

        return res;
      }, {});
  }

  showTip(highlight: T_ViewportHighlight<T_HT>, content: React$Element<*>) {
    const {
      isCollapsed,
      ghostHighlight,
      isAreaSelectionInProgress
    } = this.state;

    const highlightInProgress = !isCollapsed || ghostHighlight;

    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }

    this.renderTipAtPosition(highlight.position, content);
  }

  scaledPositionToViewport({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates
  }: T_ScaledPosition): T_Position {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber
    };
  }

  viewportPositionToScaled({
    pageNumber,
    boundingRect,
    rects
  }: T_Position): T_ScaledPosition {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber
    };
  }

  screenshot(position: T_LTWH, pageNumber: number) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;

    return getAreaAsPng(canvas, position);
  }

  renderHighlights(nextProps?: Props<T_HT>) {
    const { highlightTransform, highlights } = nextProps || this.props;

    const { pdfDocument } = this.props;

    const { tip, scrolledToHighlightId } = this.state;

    const highlightsByPage = this.groupHighlightsByPage(highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        ReactDom.render(
          <div>
            {(highlightsByPage[String(pageNumber)] || []).map(
              (highlight, index) => {
                const { position, ...rest } = highlight;

                const viewportHighlight = {
                  position: this.scaledPositionToViewport(position),
                  ...rest
                };

                if (tip && tip.highlight.id === String(highlight.id)) {
                  this.showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = Boolean(
                  scrolledToHighlightId === highlight.id
                );

                return highlightTransform(
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    this.setState({
                      tip: { highlight, callback }
                    });

                    this.showTip(highlight, callback(highlight));
                  },
                  this.hideTipAndSelection,
                  rect => {
                    const viewport = this.viewer.getPageView(pageNumber - 1)
                      .viewport;

                    return viewportToScaled(rect, viewport);
                  },
                  boundingRect => this.screenshot(boundingRect, pageNumber),
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

  hideTipAndSelection = () => {
    const tipNode = findOrCreateContainerLayer(
      this.viewer.viewer,
      'PdfHighlighter__tip-layer'
    );

    ReactDom.unmountComponentAtNode(tipNode);

    this.setState({ ghostHighlight: null, tip: null }, () =>
      this.renderHighlights()
    );
  };

  renderTipAtPosition(position: T_Position, inner: ?React$Element<*>) {
    const { boundingRect, pageNumber } = position;

    const page = {
      node: this.viewer.getPageView(pageNumber - 1).div
    };

    const pageBoundingRect = page.node.getBoundingClientRect();

    const tipNode = findOrCreateContainerLayer(
      this.viewer.viewer,
      'PdfHighlighter__tip-layer'
    );

    ReactDom.render(
      <Provider store={store}>
        <TipContainer
          scrollTop={this.viewer.container.scrollTop}
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

  onTextLayerRendered = () => {
    this.renderHighlights();
  };

  scrollTo = (highlight: T_Highlight, otherLocation = undefined) => {
    if (otherLocation) {
      this.viewer.scrollPageIntoView({pageNumber: otherLocation.page, destArray: [null, { name: 'XYZ' }, 0, otherLocation.pos]});
      return;
    }

    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;
    this.viewer.container.removeEventListener('scroll', this.onScroll);

    const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    this.viewer.scrollPageIntoView({
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

    this.setState(
      {
        scrolledToHighlightId: highlight.id
      },
      () => this.renderHighlights()
    );

    // wait for scrolling to finish
    setTimeout(() => {
      this.viewer.container.addEventListener('scroll', this.onScroll);
    }, 100);
  };

  onViewerScroll = e => {
    const maxYpos = Math.max(
      0,
      this.viewer.viewer.clientHeight - this.viewer.container.clientHeight
    );
    const progress =
      Math.min(1, this.viewer.container.scrollTop / maxYpos) * 100;
    this.props.updateReadingProgress(progress);
  };

  onDocumentReady = width => {
    const { scrollRef } = this.props;
    const viewport = this.viewer.getPageView(0).viewport;
    this.viewer.currentScaleValue = width / viewport.width - 0.05;
    scrollRef(this.scrollTo);
  };

  onSelectionChange = () => {
    const selection: Selection = window.getSelection();

    if (selection.isCollapsed) {
      this.setState({ isCollapsed: true });
      return;
    }

    const range = selection.getRangeAt(0);

    if (!range) {
      return;
    }

    this.setState({
      isCollapsed: false,
      range
    });

    this.debouncedAfterSelection();
  };

  onScroll = () => {
    const { onScrollChange } = this.props;

    onScrollChange();
    this.setState(
      {
        scrolledToHighlightId: EMPTY_ID
      },
      () => this.renderHighlights()
    );

    this.viewer.container.removeEventListener('scroll', this.onScroll);
  };

  onMouseDown = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    if (event.target.closest('.PdfHighlighter__tip-container')) {
      return;
    }

    this.hideTipAndSelection();
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      this.hideTipAndSelection();
    }
  };

  afterSelection = () => {
    const { onSelectionFinished } = this.props;

    const { isCollapsed, range } = this.state;

    if (!range || isCollapsed) {
      return;
    }

    const page = getPageFromRange(range);

    if (!page) {
      return;
    }

    const rects = getClientRects(range, page.node);

    if (rects.length === 0) {
      return;
    }

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const content = {
      text: range.toString()
    };
    const scaledPosition = this.viewportPositionToScaled(viewportPosition);

    this.renderTipAtPosition(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => this.hideTipAndSelection(),
        () =>
          this.setState(
            {
              ghostHighlight: { position: scaledPosition }
            },
            () => this.renderHighlights()
          )
      )
    );
  };

  toggleTextSelection(flag: boolean) {
    this.viewer.viewer.classList.toggle(
      'PdfHighlighter--disable-selection',
      flag
    );
  }

  onSelection = (startTarget, boundingRect, resetSelection) => {
    const { onSelectionFinished } = this.props;
    const page = getPageFromElement(startTarget);

    if (!page) {
      return;
    }

    const pageBoundingRect = {
      ...boundingRect,
      top: boundingRect.top - page.node.offsetTop,
      left: boundingRect.left - page.node.offsetLeft
    };

    const viewportPosition = {
      boundingRect: pageBoundingRect,
      rects: [],
      pageNumber: page.number
    };

    const scaledPosition = this.viewportPositionToScaled(viewportPosition);

    const image = this.screenshot(pageBoundingRect, page.number);

    this.renderTipAtPosition(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        { image },
        () => this.hideTipAndSelection(),
        () =>
          this.setState(
            {
              ghostHighlight: {
                position: scaledPosition,
                content: { image }
              }
            },
            () => {
              resetSelection();
              this.renderHighlights();
            }
          )
      )
    );
  };
  zoom = sign => {
    this.viewer.currentScaleValue =
      parseFloat(this.viewer.currentScaleValue) + sign * 0.05;
  };

  render() {
    const { enableAreaSelection, isVertical } = this.props;
    const containerStyle = isVertical
      ? { height: '100%', width: '100vw' }
      : { height: `calc(100vh - ${APP_BAR_HEIGHT}px)` };
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
          <ZoomButtom direction="in" onClick={() => this.zoom(1)} />
          <ZoomButtom direction="out" onClick={() => this.zoom(-1)} />
        </div>
        <Pointable onPointerDown={this.onMouseDown}>
          <div
            ref={node => (this.containerNode = node)}
            className="PdfHighlighter"
            onContextMenu={e => e.preventDefault()}
            onScroll={this.onViewerScroll}
            style={containerStyle}
          >
            <div className="pdfViewer" />
            {typeof enableAreaSelection === 'function' ? (
              <MouseSelection
                onDragStart={() => this.toggleTextSelection(true)}
                onDragEnd={() => this.toggleTextSelection(false)}
                onChange={isVisible =>
                  this.setState({ isAreaSelectionInProgress: isVisible })
                }
                shouldStart={event =>
                  enableAreaSelection(event) &&
                  event.target instanceof HTMLElement &&
                  Boolean(event.target.closest('.page'))
                }
                onSelection={this.onSelection}
              />
            ) : null}
          </div>
        </Pointable>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateReadingProgress: pos => {
      dispatch(actions.updateReadingProgress(pos));
    }
  };
};
const withRedux = connect(
  null,
  mapDispatchToProps
);

export default withRedux(PdfHighlighter);
