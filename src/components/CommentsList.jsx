/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React, { useEffect, useState } from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { useCookies } from 'react-cookie';
import { connect } from 'react-redux';
import axios from 'axios';
import { withRouter } from 'react-router';
import { isEmpty } from 'lodash';
import Comment from './Comment';
import { linkButton } from '../utils/presets';
import { actions } from '../actions';

const parseIdFromHash = () => window.location.hash.slice('#comment-'.length);

const refs = {};
const containerRef = React.createRef();
const WELCOME_COOKIE = 'comments-welcome';

function CommentsList({
  highlights,
  removeHighlight: removeHighlightAction,
  updateHighlight,
  toggleHighlightsVisiblity,
  isHighlightsHidden,
  match: { params },
  isVertical
}) {
  const [focusedId, setFocusedId] = useState();

  const removeHighlight = highlightId => {
    axios
      .delete(`/paper/${params.PaperId}/comment/${highlightId}`, {
        id: highlightId
      })
      .then(() => {
        removeHighlightAction(highlightId);
      })
      .catch(err => console.log(err.response));
  };

  const getHighlightById = id => {
    return highlights.find(highlight => highlight.id === id);
  };

  const scrollToComment = () => {
    const id = parseIdFromHash();
    const highlight = getHighlightById(id);
    if (highlight && containerRef.current) {
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

  const [cookies, setCookie] = useCookies([WELCOME_COOKIE]);
  const Welcome = !cookies[WELCOME_COOKIE] && (
    <div style={{ padding: '0.2rem 0.7rem' }}>
      <small>
        <p style={{ marginTop: 0 }}>
          Leave questions and comments for the community by highlighting the
          text.
        </p>
        <p>
          Want to comment on a figure? Hold ⌥ on Mac or Alt on Windows and drag
          over it.
        </p>
        <div
          css={css`
            width: 100%;
            text-align: right;
            color: inherit;
            margin-top: -17px;
          `}
        >
          <button
            type="button"
            css={linkButton}
            onClick={() => setCookie(WELCOME_COOKIE, 1)}
          >
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
          overflow-y: auto;
          flex-grow: 1;
          padding: ${isVertical ? '4px 0' : '0 0 5px'};
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
          bottom: 7px;
          @media (max-width: 576px) {
            bottom: 5px;
          }
        `}
      >
        <Tooltip
          title={`${isHighlightsHidden ? 'Show' : 'Hide'} all comments`}
          placement="top"
        >
          <IconButton onClick={() => toggleHighlightsVisiblity()}>
            <i
              className={`fas ${
                isHighlightsHidden ? 'fa-eye-slash' : 'fa-eye'
              }`}
              style={{ fontSize: 14 }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip
          title="To create area highlight hold Option/Alt key, then click and drag."
          placement="top"
        >
          <IconButton>
            <i className="fas fa-info-circle" style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = state => {
  return {
    highlights: state.paper.highlights,
    isHighlightsHidden: !isEmpty(state.paper.hiddenHighlights)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    removeHighlight: highlightId => {
      dispatch(actions.removeHighlight(highlightId));
    },
    updateHighlight: highlight => {
      dispatch(actions.updateHighlight(highlight));
    },
    toggleHighlightsVisiblity: () => {
      dispatch(actions.toggleHighlightsVisiblity());
    }
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default withRouter(withRedux(CommentsList));
