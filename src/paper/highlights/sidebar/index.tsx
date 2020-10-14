/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useHistory } from 'react-router';
import { isDirectHighlight, PaperJump } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { createEvent } from '../../../utils';
import { Spacer } from '../../../utils/Spacer';
import { JUMP_TO_EVENT } from '../../../utils/useJumpToHandler';
import { HighlightContent } from '../HighlightContent';
import styles from './styles.module.scss';

export const SidebarComments: React.FC = () => {
  const highlightsRef = React.useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const highlights = usePaperStore(state => state.highlights);
  const history = useHistory();

  highlights.forEach(h => {
    highlightsRef.current[h.id] = React.createRef<HTMLDivElement>();
  });

  return (
    <React.Fragment>
      <div className="flex flex-col w-full">
        {highlights.map(highlight => {
          if (!isDirectHighlight(highlight) || !highlight.text) return null;
          return (
            <div key={highlight.id} className={styles.commentRoot}>
              <HighlightContent
                {...highlight}
                onGoto={() => {
                  history.push({ hash: `highlight-${highlight.id}` });
                  document.dispatchEvent(
                    createEvent<PaperJump>(JUMP_TO_EVENT, {
                      id: highlight.id,
                      area: 'paper',
                      type: 'highlight',
                      location: highlight.position,
                    }),
                  );
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
