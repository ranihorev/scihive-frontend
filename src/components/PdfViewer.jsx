import React, { Component } from 'react';
import AddComment from '@material-ui/icons/AddComment';
import axios from 'axios';
import { withRouter } from 'react-router';
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight
} from './Pdf';
import { connect } from 'react-redux';

const parseIdFromHash = type => {
  if (!window.location.hash.includes(`${type}-`)) return undefined;
  return window.location.hash.slice(`#${type}-`.length);
};

const setCommentHash = id => {
  window.location.hash = `comment-${id}`;
};

const resetHash = () => {
  window.location.hash = '';
};

const HighlightPopup = ({ comment }) =>
  comment.text ? <div className="Highlight__popup">{comment.text}</div> : null;

class PdfViewer extends Component {
  componentDidMount() {
    window.addEventListener(
      'hashchange',
      this.scrollToHighlightFromHash,
      false
    );
  }

  componentWillUnmount(): void {
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
        pos:
          selectedSection.transform[selectedSection.transform.length - 1] +
          selectedSection.height +
          5
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

  onSelectionFinished = (
    position,
    content,
    hideTipAndSelection,
    transformSelection
  ) => {
    const submitComment = (comment, visibility) => {
      const data = { comment, position, content, visibility };
      const self = this;
      const {
        match: { params }
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

    return (
      <Tip
        onOpen={transformSelection}
        onConfirm={submitComment}
        tooltipText={<AddComment fontSize={'small'} />}
      />
    );
  };

  highlightTransform = (
    highlight,
    index,
    setTip,
    hideTip,
    viewportToScaled,
    screenshot,
    isScrolledTo
  ) => {
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
            { image: screenshot(boundingRect) }
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
        onMouseOver={popupContent =>
          setTip(highlight, highlight => popupContent)
        }
        onMouseOut={hideTip}
        key={index}
        children={component}
      />
    );
  };

  scrollToRef = scrollTo => {
    this.scrollViewerTo = scrollTo;
    this.scrollToHighlightFromHash();
  };

  render() {
    const { highlights, url, isVertical, beforeLoad } = this.props;
    const errorStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
    return (
      <PdfLoader
        key={url}
        url={url}
        beforeLoad={beforeLoad}
        failed={<div style={errorStyle}>Failed to download paper</div>}
      >
        {pdfDocument => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={event => event.altKey}
            onScrollChange={resetHash}
            scrollRef={this.scrollToRef}
            onSelectionFinished={this.onSelectionFinished}
            highlightTransform={this.highlightTransform}
            highlights={highlights}
            isVertical={isVertical}
          />
        )}
      </PdfLoader>
    );
  }
}

const mapStateToProps = state => {
  return {
    sections: state.paper.sections
  };
};

const withRedux = connect(mapStateToProps);

export default withRouter(withRedux(PdfViewer));
