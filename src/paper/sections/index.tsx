import { Link, Typography } from '@material-ui/core';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';
import { PaperJump } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { createEvent, getSectionPosition } from '../../utils';
import { JUMP_TO_EVENT } from '../../utils/useJumpToHandler';
import styles from './styles.module.scss';

export const TableOfContents: React.FC<{ setIsDrawerOpen: React.Dispatch<boolean> }> = ({ setIsDrawerOpen }) => {
  const tableOfContents = usePaperStore(state => state.tableOfContents);

  if (!tableOfContents || isEmpty(tableOfContents)) {
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
