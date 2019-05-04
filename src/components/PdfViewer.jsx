// @flow

import React, {Component} from 'react';
import { PdfLoader, PdfHighlighter, Tip, Highlight, Popup, AreaHighlight } from './Pdf';
import AddComment from '@material-ui/icons/AddComment';
import axios from "axios";
import {withRouter} from "react-router";

// TODO fix props
type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  updateHighlight: () => void,
  addHighlight: () => void,
  isVertical: boolean,
  match: object,
  beforeLoad: React$Element,

}

const parseIdFromHash = () => window.location.hash.slice("#highlight-".length);

const setCommentHash = (id) => {
  window.location.hash = `comment-${id}`;
};

const resetHash = () => {
  window.location.hash = "";
};

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.text}
    </div>
  ) : null;

class PdfViewer extends Component<Props> {

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());
    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener("hashchange", this.scrollToHighlightFromHash, false);
  }
  componentWillUnmount(): void {
    window.removeEventListener("hashchange", this.scrollToHighlightFromHash)
  }

  getHighlightById(id: string) {
    const { highlights } = this.props;
    return highlights.find(highlight => highlight.id === id);
  }

  onSelectionFinished = (position, content, hideTipAndSelection, transformSelection) => {
    const submitComment = (comment, visibility) => {
      const data = {comment, position, content, visibility};
      const self = this;
      const {match: {params}} = this.props;
      axios.post(`/paper/${params.PaperId}/new_comment`, data).then(res => {
        self.props.addHighlight(res.data.comment);
        hideTipAndSelection();
      }).catch(err => {
        console.log(err.response);
      });
    };

    return (
      <Tip
        onOpen={transformSelection}
        onConfirm={submitComment}
        tooltipText={<AddComment fontSize={'small'}/>}
      />
    )
  };

  highlightTransform = (highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
    const isTextHighlight = !Boolean(
      highlight.content && highlight.content.image
    );

    const component = isTextHighlight ? (
      <Highlight
        isScrolledTo={isScrolledTo}
        position={highlight.position}
        comment={highlight.comment}
        onClick={() => {setCommentHash(highlight.id)}}
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
    const {highlights, url, isVertical, beforeLoad} = this.props;
    const errorStyle = {position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'};
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
    )
  }
}

export default withRouter(PdfViewer);
