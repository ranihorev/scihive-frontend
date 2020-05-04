/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { pick } from 'lodash';
import React from 'react';
import { useCookies } from 'react-cookie';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../../stores/paper';
import { linkButton } from '../../../../utils/presets';
import { SidebarHighlightItem } from '../sidebarHighlightItem';
import { BottomBar } from './BottomBar';
import { GeneralNote } from './GeneralNote';

const WELCOME_COOKIE = 'comments-welcome';

const WelcomeMessage: React.FC = () => {
  const [cookies, setCookie] = useCookies([]);
  if (cookies[WELCOME_COOKIE]) return null;
  return (
    <div style={{ padding: '0.2rem 0.7rem' }}>
      <small>
        <p style={{ marginTop: 0 }}>Leave questions and comments for the community by highlighting the text.</p>
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

const HighlightsList: React.FC = () => {
  const [focusedId, setFocusedId] = React.useState<string | null>();
  const [hideQuoteHighlights, setHideQuoteHighlights] = React.useState<boolean>(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const highlightsRef = React.useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const { sidebarJumpData, highlights, clearSidebarJumpTo } = usePaperStore(
    state => ({
      ...pick(state, ['sidebarJumpData', 'highlights', 'clearSidebarJumpTo']),
    }),
    shallow,
  );

  // Event listener to hash change
  React.useEffect(() => {
    if (!sidebarJumpData || sidebarJumpData.type !== 'comment') return;
    const highlight = highlights.find(h => h.id === sidebarJumpData.id);
    if (highlight && containerRef.current) {
      const highlightRef = highlightsRef.current[highlight.id];
      if (!highlightRef || !highlightRef.current) return;
      containerRef.current.scrollTop = highlightRef.current.offsetTop - 10;
      setFocusedId(highlight.id);
      clearSidebarJumpTo();
      setTimeout(() => {
        setFocusedId(null);
      }, 1000);
    }
  }, [sidebarJumpData, highlights, clearSidebarJumpTo]);

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
          padding: 0 0 5px;
          padding-bottom: 45px;
        `}
        ref={containerRef}
      >
        <WelcomeMessage />
        <div
          css={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: `8px 0 12px` }}
        >
          <GeneralNote />
        </div>
        {highlights.map(highlight => {
          if (hideQuoteHighlights && !highlight.text) return null;
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
      <BottomBar {...{ hideQuoteHighlights, setHideQuoteHighlights }} />
    </React.Fragment>
  );
};

export default HighlightsList;
