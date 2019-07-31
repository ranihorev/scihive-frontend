/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import { Paper } from '@material-ui/core';
import * as copy from 'clipboard-copy';
import { toast } from 'react-toastify';
import { PdfLoader, Tip, Highlight, AreaHighlight, PdfAnnotator } from './Pdf';
import { actions } from '../actions';
import { popupCss } from '../utils/presets';
import { TextLinkifyLatex } from './TextLinkifyLatex';
import { presets, getSectionPosition } from '../utils';
import { compactButtonStyle } from './Pdf/components/Tip';
import { PopupManager, Popup } from './Popup';

const HighlightPopup = ({ content, comment }) => {
  let copyButton;
  const hasContent = content && content.text;
  if (hasContent) {
    copyButton = (
      <span
        css={compactButtonStyle}
        role="button"
        onClick={() => {
          copy(content.text);
          toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
        }}
      >
        <i className="far fa-copy" />
      </span>
    );
  }
  if (comment.text) {
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

const ReferencesPopupManager = ({ referencePopoverAnchor, clearAnchor, reference }) => {
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

class PdfViewer extends Component {
  state = {
    referencePopoverAnchor: undefined,
    referenceCite: '',
    highlightPopoverAnchor: undefined,
  };

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

  onSelectionFinished = (position, content, hideTipAndSelection, transformSelection) => {
    const submitComment = (comment, visibility) => {
      const data = { comment, position, content, visibility };
      const self = this;
      const {
        match: { params },
      } = this.props;
      axios
        .post(`/paper/${params.PaperId}/new_comment`, data)
        .then(res => {
          self.props.addHighlight(res.data.comment);
          hideTipAndSelection();
        })
        .catch(err => {
          console.log(err.response);
        });
    };

    return <Tip onOpen={transformSelection} onConfirm={submitComment} />;
  };

  onHighlightClick = id => {
    this.props.jumpToComment(id);
    this.props.history.push({ hash: `comment-${id}` });
  };

  highlightTransform = (highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
    const isTextHighlight = !(highlight.content && highlight.content.image);
    const component = isTextHighlight ? (
      <Highlight
        isScrolledTo={isScrolledTo}
        position={highlight.position}
        comment={highlight.comment}
        onClick={() => {
          this.props.switchSidebarToComments();
          this.onHighlightClick(highlight.id);
        }}
      />
    ) : (
      <AreaHighlight
        highlight={highlight}
        onChange={boundingRect => {
          this.props.updateHighlight(
            highlight.id,
            { boundingRect: viewportToScaled(boundingRect) },
            { image: screenshot(boundingRect) },
          );
        }}
        onClick={event => {
          event.stopPropagation();
          this.props.switchSidebarToComments();
          this.onHighlightClick(highlight.id);
        }}
      />
    );
    return <Popup popupContent={<HighlightPopup {...highlight} />} key={index} bodyElement={component} />;
  };

  render() {
    const { url, isVertical, beforeLoad, references } = this.props;
    const { referencePopoverAnchor, highlightPopoverAnchor, referenceCite } = this.state;
    const errorStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
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
              onSelectionFinished={this.onSelectionFinished}
              highlightTransform={this.highlightTransform}
              isVertical={isVertical}
              onReferenceEnter={e => {
                const cite = decodeURIComponent(e.target.getAttribute('href').replace('#cite.', ''));
                if (references.hasOwnProperty(cite)) {
                  if (isMobile) {
                    e.target.onclick = event => {
                      event.preventDefault();
                    };
                  }
                  if (e.type === 'click' && !isMobile) {
                    this.setState({ referencePopoverAnchor: undefined, referenceCite: '' });
                  } else {
                    this.setState({
                      referencePopoverAnchor: e.target,
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

const mapStateToProps = state => {
  return {
    sections: state.paper.sections,
    references: state.paper.references,
    highlights: state.paper.highlights,
    jumpData: state.paper.jumpData,
  };
};

const mapDispatchToProps = dispatch => ({
  addHighlight: highlight => {
    dispatch(actions.addHighlight(highlight));
  },
  switchSidebarToComments: () => {
    dispatch(actions.setSidebarTab('Comments'));
  },
  clearJumpTo: () => {
    dispatch(actions.clearJumpTo());
  },
  jumpTo: (type, id, location) => {
    dispatch(actions.jumpTo({ area: 'paper', type, id, location }));
  },
  jumpToComment: id => {
    dispatch(actions.jumpTo({ area: 'sidebar', type: 'comment', id }));
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRouter(withRedux(PdfViewer));
