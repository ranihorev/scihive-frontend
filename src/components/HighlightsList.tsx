/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import { isEmpty } from 'lodash';
import React from 'react';
import { useCookies } from 'react-cookie';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import useReactRouter from 'use-react-router';
import { actions } from '../actions';
import { JumpToData, RootState, T_Highlight, T_ScaledPosition } from '../models';
import { linkButton, themePalette, COLORS } from '../utils/presets';
import { SidebarHighlightItem } from './sidebarHighlightItem';
import { Switch } from '@material-ui/core';

const WELCOME_COOKIE = 'comments-welcome';

const floatingIconCss = css`
  color: ${themePalette.primary.main};
  font-size: 14px;
`;

const WelcomeMessage: React.FC = () => {
  const [cookies, setCookie] = useCookies([WELCOME_COOKIE]);
  if (cookies[WELCOME_COOKIE]) return null;
  return (
    <div style={{ padding: '0.2rem 0.7rem' }}>
      <small>
        <p style={{ marginTop: 0 }}>Leave questions and comments for the community by highlighting the text.</p>
        <p>Want to comment on a figure? Hold ⌥ on Mac or Alt on Windows and drag over it.</p>
        <div
          css={css`
            width: 100%;
            text-align: right;
            color: inherit;
            margin-top: -17px;
          `}
        >
          <button type="button" css={linkButton} onClick={() => setCookie(WELCOME_COOKIE, 1)}>
            Got it
          </button>
        </div>
      </small>
    </div>
  );
};

interface CommentsListProps {
  highlights: T_Highlight[];
  removeHighlight: (highlightId: string) => void;
  updateHighlight: (highlight: T_Highlight) => void;
  toggleHighlightsVisiblity: () => void;
  isHighlightsHidden: boolean;
  jumpToHighlight: (id: string, location: T_ScaledPosition) => void;
  isVertical: boolean;
  jumpData?: JumpToData;
  clearJumpTo: () => void;
}

const HighlightsList: React.FC<CommentsListProps> = ({
  highlights,
  removeHighlight: removeHighlightAction,
  updateHighlight,
  toggleHighlightsVisiblity,
  isHighlightsHidden,
  jumpToHighlight,
  isVertical,
  jumpData,
  clearJumpTo,
}) => {
  const [focusedId, setFocusedId] = React.useState();
  const [hideEmpty, setHideEmpty] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const highlightsRef = React.useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const {
    match: { params },
  } = useReactRouter();

  const removeHighlight = (highlightId: string) => {
    axios
      .delete(`/paper/${params.PaperId}/comment/${highlightId}`)
      .then(() => {
        removeHighlightAction(highlightId);
      })
      .catch((err: any) => console.log(err.response));
  };

  // Event listener to hash change
  React.useEffect(() => {
    if (!jumpData || jumpData.type !== 'comment') return;
    const highlight = highlights.find(h => h.id === jumpData.id);
    if (highlight && containerRef.current) {
      const highlightRef = highlightsRef.current[highlight.id];
      if (!highlightRef || !highlightRef.current) return;
      containerRef.current.scrollTop = highlightRef.current.offsetTop - 10;
      setFocusedId(highlight.id);
      clearJumpTo();
      setTimeout(() => {
        setFocusedId(null);
      }, 1000);
    }
  }, [jumpData, highlights, clearJumpTo]);

  highlights.forEach(h => {
    highlightsRef.current[h.id] = React.createRef<HTMLDivElement>();
  });

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
        <WelcomeMessage />
        {highlights.map(highlight => {
          if (hideEmpty && !highlight.comment.text) return null;
          return (
            <SidebarHighlightItem
              key={highlight.id}
              isFocused={highlight.id === focusedId}
              ref={highlightsRef.current[highlight.id]}
              highlight={highlight}
              removeHighlight={removeHighlight}
              updateHighlight={updateHighlight}
              jumpToHighlight={() => jumpToHighlight(highlight.id, highlight.position)}
            />
          );
        })}
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          width: '100%',
          left: 0,
          padding: '0 3px',
          bottom: 7,
          '@media (max-width: 576px)': {
            bottom: 5,
          },
        }}
      >
        <div css={{ display: 'flex', flexDirection: 'row', fontSize: 12, alignItems: 'center', color: COLORS.grey }}>
          <Switch checked={hideEmpty} onChange={() => setHideEmpty(!hideEmpty)} size="small" color="primary" />
          Highlights
        </div>
        <div>
          <Tooltip title={`${isHighlightsHidden ? 'Show' : 'Hide'} all comments`} placement="top">
            <IconButton onClick={() => toggleHighlightsVisiblity()}>
              <i className={`fas ${isHighlightsHidden ? 'fa-eye-slash' : 'fa-eye'}`} css={floatingIconCss} />
            </IconButton>
          </Tooltip>
          <Tooltip title="To create area highlight hold Option/Alt key, then click and drag." placement="top">
            <IconButton>
              <i className="fas fa-info-circle" css={floatingIconCss} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    highlights: state.paper.highlights,
    isHighlightsHidden: !isEmpty(state.paper.hiddenHighlights),
    jumpData: state.paper.jumpData,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    removeHighlight: (highlightId: string) => {
      dispatch(actions.removeHighlight(highlightId));
    },
    updateHighlight: (highlight: T_Highlight) => {
      dispatch(actions.updateHighlight(highlight));
    },
    toggleHighlightsVisiblity: () => {
      dispatch(actions.toggleHighlightsVisiblity());
    },
    jumpToHighlight: (id: string, location: T_ScaledPosition) => {
      dispatch(actions.jumpTo({ area: 'paper', type: 'highlight', id, location }));
    },
    clearJumpTo: () => {
      dispatch(actions.clearJumpTo());
    },
  };
};
const withRedux = connect(mapStateToProps, mapDispatchToProps);

export default withRedux(HighlightsList);
