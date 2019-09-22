/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import copy from 'clipboard-copy';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import {
  isValidHighlight,
  Reference,
  References,
  RootState,
  Section,
  TempHighlight,
  T_Highlight,
  T_LTWH,
  T_Position,
} from '../models';
import { presets } from '../utils';
import { popupCss } from '../utils/presets';
import { AreaHighlight, Highlight, PdfAnnotator, PdfLoader } from './Pdf';
import { compactButtonStyle } from './Pdf/components/Tip';
import { viewportToScaled } from './Pdf/lib/coordinates';
import { Popup, PopupManager } from './Popup';
import { TextLinkifyLatex } from './TextLinkifyLatex';

const HighlightPopup: React.FC<T_Highlight> = ({ content, comment }) => {
  let copyButton;
  const hasContent = content && content.text;
  if (hasContent) {
    copyButton = (
      <span
        css={compactButtonStyle}
        role="button"
        onClick={async () => {
          await copy(content.text || '');
          toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
        }}
      >
        <i className="far fa-copy" />
      </span>
    );
  }
  if (comment && comment.text) {
    return (
      <div>
        <Paper css={popupCss}>
          <div
            css={css`
              ${presets.row};
              align-items: center;
            `}
          >
            <div
              css={
                hasContent
                  ? css`
                      border-right: 1px solid #dadada;
                      padding-right: 8px;
                    `
                  : undefined
              }
            >
              <TextLinkifyLatex text={comment.text} />
            </div>
            {copyButton}
          </div>
        </Paper>
      </div>
    );
  }
  if (hasContent) {
    return (
      <Paper
        css={css`
          ${popupCss};
          padding: 6px;
        `}
      >
        {copyButton}
      </Paper>
    );
  }
  return null;
};

const ReferencesPopupManager: React.FC<{
  referencePopoverAnchor?: HTMLElement;
  clearAnchor: () => void;
  reference: Reference;
}> = ({ referencePopoverAnchor, clearAnchor, reference }) => {
  const content = reference ? (
    <Paper css={popupCss}>
      {reference.arxivId && (
        <div
          css={css`
            ${presets.row};
            width: 100%;
            justify-content: flex-end;
          `}
        >
          <Link
            to={`/paper/${reference.arxivId}`}
            css={css`
              color: ${presets.themePalette.primary.main};
            `}
          >
            <i className="fas fa-external-link-alt" />
          </Link>
        </div>
      )}
      <div
        css={css`
          p {
            margin: 0.2rem;
          }
        `}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: reference.html }}
      />
    </Paper>
  ) : null;

  return <PopupManager anchorEl={referencePopoverAnchor} clearAnchor={clearAnchor} popupContent={content} />;
};

interface PdfViewerProps extends RouteComponentProps {
  url: string;
  isVertical: boolean;
  beforeLoad: React.ReactElement;
  sections?: Section[];
  references: References;
  highlights: T_Highlight[];
  switchSidebarToComments: () => void;
  clearJumpTo: () => void;
  jumpToComment: (id: string) => void;
  updateHighlight: (highlight: T_Highlight) => void;
}

interface PdfViewerState {
  referencePopoverAnchor?: HTMLElement;
  referenceCite: string;
  highlightPopoverAnchor?: HTMLElement;
}

class PdfViewer extends Component<PdfViewerProps, PdfViewerState> {
  state: PdfViewerState = { referenceCite: '' };

  componentDidMount() {
    // const re = new RegExp('(?<type>(section|highlight))-(?<id>.*)');
    // const whereTo = window.location.hash.match(re);
    // if (whereTo && whereTo.groups) {
    //   const { type, id } = whereTo.groups;
    //   if (type === 'highlight') {
    //     const highlight = this.props.highlights.find(h => h.id === id);
    //     if (highlight) {
    //       this.props.jumpTo(type, id, highlight.position);
    //     }
    //   } else if (type === 'section') {
    //     if (this.props.sections[id]) {
    //       this.props.jumpTo(type, id, getSectionPosition(this.props.sections[id]));
    //     }
    //   }
    // }
  }

  onHighlightClick = (id: string) => {
    this.props.jumpToComment(id);
    this.props.history.push({ hash: `comment-${id}` });
  };

  highlightTransform = (
    highlight: T_Highlight | TempHighlight,
    index: number,
    viewportPosition: T_Position,
    screenshot: (boundingRect: T_LTWH) => string,
    isScrolledTo: boolean,
  ) => {
    const isTextHighlight = !(highlight.content && highlight.content.image);
    const id = isValidHighlight(highlight) ? highlight.id : `temp-${index}`;
    const component = isTextHighlight ? (
      <Highlight
        key={`highlight-${id}`}
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onClick={() => {
          if (!isValidHighlight(highlight)) return;
          this.props.switchSidebarToComments();
          this.onHighlightClick(highlight.id);
        }}
      />
    ) : (
      <AreaHighlight
        key={`area-highlight-${id}`}
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onChange={(boundingRect: T_LTWH) => {
          const { width, height } = highlight.position.boundingRect;
          if (!isValidHighlight(highlight)) return;
          this.props.updateHighlight({
            ...highlight,
            position: { ...highlight.position, boundingRect: viewportToScaled(boundingRect, { width, height }) },
            content: { ...highlight.content, image: screenshot(boundingRect) },
          });
        }}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          if (!isValidHighlight(highlight)) return;
          this.props.switchSidebarToComments();
          this.onHighlightClick(highlight.id);
        }}
      />
    );
    if (isValidHighlight(highlight)) {
      return (
        <Popup popupContent={<HighlightPopup {...highlight} />} key={`highligh-popup-${id}`} bodyElement={component} />
      );
    }
    return component;
  };

  render() {
    const { url, isVertical, beforeLoad, references } = this.props;
    const { referencePopoverAnchor, highlightPopoverAnchor, referenceCite } = this.state;
    const errorStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    } as const;
    return (
      <React.Fragment>
        <PdfLoader
          key={url}
          url={url}
          beforeLoad={beforeLoad}
          failed={<div style={errorStyle}>Failed to download paper</div>}
        >
          {pdfDocument => (
            <PdfAnnotator
              pdfDocument={pdfDocument}
              enableAreaSelection={event => event.altKey}
              highlightTransform={this.highlightTransform}
              isVertical={isVertical}
              onReferenceEnter={e => {
                const target = e.target as HTMLElement;
                if (!target) return;
                const cite = decodeURIComponent((target.getAttribute('href') || '').replace('#cite.', ''));
                if (references.hasOwnProperty(cite)) {
                  if (isMobile) {
                    target.onclick = event => {
                      event.preventDefault();
                    };
                  }
                  if (e.type === 'click' && !isMobile) {
                    this.setState({ referencePopoverAnchor: undefined, referenceCite: '' });
                  } else {
                    this.setState({
                      referencePopoverAnchor: target,
                      referenceCite: cite,
                    });
                  }
                }
              }}
            />
          )}
        </PdfLoader>
        {references && (
          <ReferencesPopupManager
            referencePopoverAnchor={referencePopoverAnchor}
            clearAnchor={() => this.setState({ referencePopoverAnchor: undefined, referenceCite: '' })}
            reference={references[referenceCite]}
          />
        )}
        <PopupManager
          anchorEl={highlightPopoverAnchor}
          clearAnchor={() => {
            this.setState({ highlightPopoverAnchor: undefined });
          }}
          popupContent={<div>Hello</div>}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    sections: state.paper.sections,
    references: state.paper.references,
    highlights: state.paper.highlights,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchSidebarToComments: () => {
    dispatch(actions.setSidebarTab('Comments'));
  },
  clearJumpTo: () => {
    dispatch(actions.clearJumpTo());
  },
  jumpToComment: (id: string) => {
    dispatch(actions.jumpTo({ area: 'sidebar', type: 'comment', id }));
  },
  updateHighlight: (highlight: T_Highlight) => {
    dispatch(actions.updateHighlight(highlight));
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRouter(withRedux(PdfViewer));
