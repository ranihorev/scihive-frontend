// @flow

import React, {useEffect, useState} from "react";

import type { T_Highlight } from "./Pdf/types";
import Comment from "./Comment";
import './CommentsList.scss';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  removeHighlight: () => void,
  updateHighlight: () => void,

};


const parseIdFromHash = () => window.location.hash.slice("#comment-".length);

let refs = {};
let containerRef = React.createRef();

function CommentsList({ highlights, removeHighlight, updateHighlight }: Props) {

  const [focusedId, setFocusedId] = useState();

  // Event listener to hash change
  useEffect(() => {
    window.addEventListener("hashchange", scrollToComment);
    return () => {
      window.removeEventListener("hashchange", scrollToComment);
    };
  });

  const getHighlightById = (id: string) => {
    return highlights.find(highlight => highlight.id === id);
  };

  const scrollToComment = () => {
    const id = parseIdFromHash();
    const highlight = getHighlightById(id);
    if (highlight) {
      containerRef.current.scrollTop = refs[highlight.id].offsetTop-10;
      setFocusedId(highlight.id);
      setTimeout(() => {setFocusedId(null)}, 1000);
    }
  };

  highlights.forEach((h) => refs[h.id] = React.createRef());

  const CommentsEmptyState = (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Welcome!</h2>

        <p>
          <small>
            Leave questions and comments for the community by highlighting the text.<br /><br />
            Want to comment on a figure or a table? Hold ⌥ Option key on Mac or Alt on Windows and drag over them.
          </small>
        </p>
      </div>)

  return (
      <React.Fragment>
        <div className='comments-container' ref={containerRef}>
          {(highlights.length > 0) ?
              highlights.map((highlight, index) => (
                  <Comment
                      key={index}
                      isFocused={highlight.id === focusedId}
                      setRef={el => refs[highlight.id] = el}
                      highlight={highlight}
                      removeHighlight={removeHighlight}
                      updateHighlight={updateHighlight}
                  />
              )) :
              CommentsEmptyState
          }
        </div>
        <div className="comments-help">
          <Tooltip title="To create area highlight hold Option/Alt key, then click and drag." placement="bottom">
            <IconButton>
              <i className="fas fa-info-circle" style={{fontSize: 18}}></i>
            </IconButton>
          </Tooltip>
        </div>
      </React.Fragment>
  );
}

export default CommentsList;
