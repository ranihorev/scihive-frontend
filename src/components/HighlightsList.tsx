/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Switch } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import { useCookies } from 'react-cookie';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../stores/paper';
import { COLORS, linkButton, themePalette } from '../utils/presets';
import { SidebarHighlightItem } from './sidebarHighlightItem';

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

const HighlightsList: React.FC<{ isVertical: boolean }> = ({ isVertical }) => {
  const [focusedId, setFocusedId] = React.useState();
  const [hideEmpty, setHideEmpty] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const highlightsRef = React.useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const { jumpData, highlights, clearJumpTo, isHighlightsHidden, toggleHighlightsVisiblity } = usePaperStore(
    state => ({
      ...pick(state, ['jumpData', 'highlights', 'clearJumpTo', 'toggleHighlightsVisiblity']),
      isHighlightsHidden: !isEmpty(state.hiddenHighlights),
    }),
    shallow,
  );

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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          left: 5,
          right: 5,
          bottom: 0,
          paddingBottom: 5,
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

export default HighlightsList;
