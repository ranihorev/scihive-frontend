import { Link, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { isEmpty, range } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { PaperJump } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { createEvent, getSectionPosition } from '../../utils';
import { Spacer } from '../../utils/Spacer';
import { JUMP_TO_EVENT } from '../../utils/useJumpToHandler';
import styles from './styles.module.scss';

export const PaperSections: React.FC = () => {
  const { sections } = usePaperStore(state => ({ sections: state.sections }), shallow);
  if (sections === undefined) {
    return (
      <React.Fragment>
        {range(0, 5).map(idx => (
          <ContentLoader key={idx} height={100}>
            <React.Fragment>
              <rect x="0" y="0" rx="3" ry="3" width="90%" height="13" />
              <rect x="0" y="30" rx="3" ry="3" width="80%" height="13" />
              <rect x="20" y="60" rx="3" ry="3" width="80%" height="13" />
            </React.Fragment>
          </ContentLoader>
        ))}
      </React.Fragment>
    );
  }

  if (isEmpty(sections)) {
    return (
      <div className={baseStyles.centeredRow}>
        <WarningIcon fontSize="small" />
        <Spacer size={8} />
        <Typography variant="body2">Failed to extract sections</Typography>
      </div>
    );
  }

  return (
    <div className={baseStyles.col}>
      {sections.map((section, idx) => {
        return (
          <Link
            href={`#section-${idx}`}
            color="textSecondary"
            variant="body2"
            className={styles.section}
            onClick={() => {
              console.log(section);
              document.dispatchEvent(
                createEvent<PaperJump>(JUMP_TO_EVENT, {
                  area: 'paper',
                  type: 'section',
                  id: idx.toString(),
                  location: getSectionPosition(section),
                }),
              );
            }}
            key={idx}
          >
            {section.str}
          </Link>
        );
      })}
    </div>
  );
};
