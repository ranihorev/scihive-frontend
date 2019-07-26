/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import { Popper, Paper } from '@material-ui/core';
import * as copy from 'clipboard-copy';
import { toast } from 'react-toastify';
import { PdfLoader, Tip, Highlight, Popup, AreaHighlight, PdfAnnotator } from './Pdf';
import { actions } from '../actions';
import { popupCss } from '../utils/presets';
import { TextLinkifyLatex } from './TextLinkifyLatex';
import { presets, getSectionPosition } from '../utils';
import { compactButtonStyle, CompactTip } from './Pdf/components/Tip';

const HighlightPopup = ({ content, comment }) => {
  let copyButton;
  if (content && content.text) {
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
      <Paper css={popupCss}>
        <TextLinkifyLatex text={comment.text} />
        {copyButton}
      </Paper>
    );
  }
  if (content && content.text) {
    return <CompactTip>{copyButton}</CompactTip>;
  }
  return null;
};
class PdfViewer extends Component {
  state = {
    referencePopoverAnchor: undefined,
    referenceCite: '',
  };

  referenceTimeoutId = null;

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

  componentWillUnmount(): void {
    if (this.referenceTimeoutId) this.clearHideReferenceTimeout();
  }

  clearHideReferenceTimeout = () => {
    clearTimeout(this.referenceTimeoutId);
    this.referenceTimeoutId = undefined;
  };

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
          event.preventDefault();
          this.onHighlightClick(highlight.id);
        }}
      />
    );
    return (
      <Popup
        popupContent={<HighlightPopup {...highlight} />}
        onMouseOver={popupContent => setTip(highlight, () => popupContent)}
        onMouseOut={hideTip}
        key={index}
      >
        {component}
      </Popup>
    );
  };

  hideReferencePopover = () => {
    if (this.state.referencePopoverAnchor) {
      if (this.referenceTimeoutId) return;
      this.referenceTimeoutId = setTimeout(() => {
        this.setState({ referencePopoverAnchor: undefined, referenceCite: '' });
      }, 300);
    }
  };

  render() {
    const { url, isVertical, beforeLoad, references } = this.props;
    const { referencePopoverAnchor, referenceCite } = this.state;
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
                const cite = e.target.getAttribute('href').replace('#cite.', '');
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
                    this.clearHideReferenceTimeout();
                  }
                }
              }}
              onReferenceLeave={this.hideReferencePopover}
            />
          )}
        </PdfLoader>
        {references[referenceCite] && (
          <Popper
            open={Boolean(referencePopoverAnchor)}
            anchorEl={referencePopoverAnchor}
            placement="top"
            style={{ zIndex: 10 }}
          >
            <Paper
              css={popupCss}
              onMouseEnter={() => {
                this.clearHideReferenceTimeout();
              }}
              onMouseLeave={this.hideReferencePopover}
            >
              {references[referenceCite].arxivId && (
                <div
                  css={css`
                    ${presets.row};
                    width: 100%;
                    justify-content: flex-end;
                  `}
                >
                  <Link
                    to={`/paper/${references[referenceCite].arxivId}`}
                    css={css`
                      color: ${presets.themePalette.primary.main};
                    `}
                  >
                    <i className="fas fa-external-link-alt" />
                  </Link>
                </div>
              )}
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: references[referenceCite].html }}
              />
            </Paper>
          </Popper>
        )}
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
