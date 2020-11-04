import { Link, Typography } from '@material-ui/core';
import cx from 'classnames';
import { isEmpty, range } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { PaperJump } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { createEvent, getSectionPosition } from '../../utils';
import { JUMP_TO_EVENT } from '../../utils/useJumpToHandler';
import styles from './styles.module.scss';

export const TableOfContents: React.FC<{ setIsDrawerOpen: React.Dispatch<boolean> }> = ({ setIsDrawerOpen }) => {
  const tableOfContents = usePaperStore(state => state.tableOfContents);
  if (tableOfContents === undefined) {
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

  if (isEmpty(tableOfContents)) {
    return (
      <Typography variant="body2" color="textSecondary">
        Failed to extract table of contents :(
      </Typography>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {tableOfContents.map((section, idx) => {
        return (
          <Link
            href={`#section-${idx}`}
            color="textSecondary"
            variant="body2"
            className={cx(styles.section, 'truncate')}
            onClick={() => {
              document.dispatchEvent(
                createEvent<PaperJump>(JUMP_TO_EVENT, {
                  area: 'paper',
                  type: 'section',
                  id: idx.toString(),
                  location: getSectionPosition(section),
                }),
              );
              setIsDrawerOpen(false);
            }}
            key={idx}
          >
            {section.text}
          </Link>
        );
      })}
    </div>
  );
};
