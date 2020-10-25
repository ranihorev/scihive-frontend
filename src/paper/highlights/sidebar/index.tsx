/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useHistory } from 'react-router';
import { isDirectHighlight, PaperJump, AllHighlight, T_Highlight } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { createEvent } from '../../../utils';
import { Spacer } from '../../../utils/Spacer';
import { JUMP_TO_EVENT } from '../../../utils/useJumpToHandler';
import { HighlightContent } from '../HighlightContent';
import styles from './styles.module.scss';
import { isEqual, isEmpty } from 'lodash';
import { Typography } from '@material-ui/core';

const filterHighlights = (highlights: AllHighlight[]): T_Highlight[] => {
  // Only keep comments with text
  return highlights.filter(isDirectHighlight).filter(h => Boolean(h.text));
};

export const SidebarComments: React.FC = () => {
  const highlights = usePaperStore(state => filterHighlights(state.highlights), isEqual);
  const history = useHistory();

  return (
    <React.Fragment>
      <div className="flex flex-col w-full">
        {isEmpty(highlights) ? (
          <Typography variant="body2" color="textSecondary">
            No comments yet. Be the first to add one!
          </Typography>
        ) : (
          highlights.map(highlight => {
            // if () return null;
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
          })
        )}
      </div>
    </React.Fragment>
  );
};
