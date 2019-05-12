// @flow
/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React, { useEffect, useState } from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import {useCookies} from "react-cookie";
import type { T_Highlight } from './Pdf/types';
import Comment from './Comment';
import {linkButton} from "../utils/presets";

type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  removeHighlight: () => void,
  updateHighlight: () => void
};

const parseIdFromHash = () => window.location.hash.slice('#comment-'.length);

const refs = {};
const containerRef = React.createRef();
const WELCOME_COOKIE = 'comments-welcome';

function CommentsList({ highlights, removeHighlight, updateHighlight }: Props) {
  const [focusedId, setFocusedId] = useState();

  const getHighlightById = (id: string) => {
    return highlights.find(highlight => highlight.id === id);
  };

  const scrollToComment = () => {
    const id = parseIdFromHash();
    const highlight = getHighlightById(id);
    if (highlight) {
      containerRef.current.scrollTop = refs[highlight.id].offsetTop - 10;
      setFocusedId(highlight.id);
      setTimeout(() => {
        setFocusedId(null);
      }, 1000);
    }
  };

  // Event listener to hash change
  useEffect(() => {
    window.addEventListener('hashchange', scrollToComment);
    return () => {
      window.removeEventListener('hashchange', scrollToComment);
    };
  });

  highlights.forEach(h => {
    refs[h.id] = React.createRef();
  });

  const [cookies, setCookie,] = useCookies([WELCOME_COOKIE]);
  const Welcome = !cookies[WELCOME_COOKIE] && (
    <div style={{ padding: '0.2rem 0.7rem' }}>
      <small>
        <p>
          Leave questions and comments for the community by highlighting the
          text.
        </p>
        <p>
          Want to comment on a figure? Hold ⌥ on Mac or Alt on Windows and drag
          over it.
        </p>
        <div css={css`
        width: 100%;
        text-align: right;
        color: inherit;
        margin-top: -17px;
        `}>
          <button type="button" css={linkButton} onClick={() => setCookie(WELCOME_COOKIE, 1)}>
            Got it
          </button>
        </div>

      </small>
    </div>
  );

  return (
    <React.Fragment>
      <div
        css={css`
          position: relative;
          color: rgb(119, 119, 119);
          overflow-y: scroll;
          height: 100%;
        `}
        ref={containerRef}
      >
        {Welcome}
        {highlights.map(highlight => (
          <Comment
            key={highlight.id}
            isFocused={highlight.id === focusedId}
            setRef={el => {
              refs[highlight.id] = el;
            }}
            highlight={highlight}
            removeHighlight={removeHighlight}
            updateHighlight={updateHighlight}
          />
        ))}
      </div>
      <div
        css={css`
          position: absolute;
          right: 1px;
          bottom: 10px;
          @media (max-width: 576px) {
            bottom: 5px;
          }
        `}
      >
        <Tooltip
          title="To create area highlight hold Option/Alt key, then click and drag."
          placement="bottom"
        >
          <IconButton>
            <i className="fas fa-info-circle" style={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  );
}

export default CommentsList;
