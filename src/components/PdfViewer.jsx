/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component } from 'react';
import AddComment from '@material-ui/icons/AddComment';
import axios from 'axios';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import { isMobile } from 'react-device-detect';
import { PdfLoader, Tip, Highlight, Popup, AreaHighlight, PdfAnnotator } from './Pdf';
import { actions } from '../actions';
import { popupCss } from '../utils/presets';

const parseIdFromHash = type => {
  if (!window.location.hash.includes(`${type}-`)) return undefined;
  return window.location.hash.slice(`#${type}-`.length);
};

const setCommentHash = id => {
  window.location.hash = `comment-${id}`;
};

const HighlightPopup = ({ comment }) => (comment.text ? <Paper css={popupCss}>{comment.text}</Paper> : null);

class PdfViewer extends Component {
  state = {
    referencePopoverAnchor: undefined,
    referenceCite: '',
  };

  referenceTimeoutId = null;

  componentDidMount() {
    window.addEventListener('hashchange', this.scrollToHighlightFromHash, false);
  }

  componentWillUnmount(): void {
    if (this.referenceTimeoutId) clearTimeout(this.referenceTimeoutId);
    window.removeEventListener('hashchange', this.scrollToHighlightFromHash);
  }

  getHighlightById(id: string) {
    const { highlights } = this.props;
    return highlights.find(highlight => highlight.id === id);
  }

  scrollToSectionFromHash = sectionId => {
    const { sections } = this.props;
    if (sections) {
      const selectedSection = sections[sectionId];
      this.scrollViewerTo(undefined, {
        page: selectedSection.page + 1,
        pos: selectedSection.transform[selectedSection.transform.length - 1] + selectedSection.height + 5,
      });
    }
  };

  scrollToHighlightFromHash = () => {
    const highlightId = parseIdFromHash('highlight');
    const sectionId = parseIdFromHash('section');
    if (highlightId) {
      const highlight = this.getHighlightById(highlightId);
      if (highlight) {
        this.scrollViewerTo(highlight);
      }
    } else if (sectionId) {
      this.scrollToSectionFromHash(sectionId);
    }
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

    return <Tip onOpen={transformSelection} onConfirm={submitComment} tooltipText={<AddComment fontSize="small" />} />;
  };

  highlightTransform = (highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
    const isTextHighlight = !(highlight.content && highlight.content.image);

    const component = isTextHighlight ? (
      <Highlight
        isScrolledTo={isScrolledTo}
        position={highlight.position}
        comment={highlight.comment}
        onClick={() => {
          setCommentHash(highlight.id);
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
          setCommentHash(highlight.id);
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

  scrollToRef = scrollTo => {
    this.scrollViewerTo = scrollTo;
    this.scrollToHighlightFromHash();
  };

  hideReferencePopover = () => {
    if (this.state.referencePopoverAnchor) {
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
              scrollRef={this.scrollToRef}
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
                  }
                }
              }}
              onReferenceLeave={this.hideReferencePopover}
            />
          )}
        </PdfLoader>
        <Popper
          open={Boolean(referencePopoverAnchor)}
          anchorEl={referencePopoverAnchor}
          placement="top"
          style={{ zIndex: 10 }}
        >
          <Paper css={popupCss}>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: references[referenceCite] }}
              onMouseEnter={() => {
                clearTimeout(this.referenceTimeoutId);
              }}
              onMouseLeave={this.hideReferencePopover}
            />
          </Paper>
        </Popper>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    sections: state.paper.sections,
    references: state.paper.references,
    highlights: state.paper.highlights,
  };
};

const mapDispatchToProps = dispatch => ({
  addHighlight: highlight => {
    dispatch(actions.addHighlight(highlight));
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRouter(withRedux(PdfViewer));
