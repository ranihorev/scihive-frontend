/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { isDirectHighlight } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { Spacer } from '../../utils/Spacer';
import { HighlightContent } from '../HighlightContent';
import styles from './styles.module.scss';
import { useHistory } from 'react-router';

export const SidebarComments: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const highlightsRef = React.useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const highlights = usePaperStore(state => state.highlights);
  const history = useHistory();

  highlights.forEach(h => {
    highlightsRef.current[h.id] = React.createRef<HTMLDivElement>();
  });

  return (
    <React.Fragment>
      <div ref={containerRef}>
        {highlights.map(highlight => {
          if (!isDirectHighlight(highlight) || !highlight.text) return null;
          return (
            <div key={highlight.id} className={styles.commentRoot}>
              <HighlightContent
                {...highlight}
                onGoto={() => {
                  history.push({ hash: `highlight-${highlight.id}` });
                }}
              />
              <Spacer size={12} />
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
};
