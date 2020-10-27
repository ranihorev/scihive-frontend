/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton, Link, ListItem, Typography } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import cx from 'classnames';
import moment from 'moment';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { EditGroup } from '../bookmark/EditGroup';
import { DetailedGroup } from '../models';
import { PopoverMenu } from '../utils/PopoverMenu';
import { getGroupColor } from '../utils/presets';
import styles from './styles.module.scss';
import { itemPadding } from './utils';

interface GroupProps {
  group: DetailedGroup;
}

export const GroupRender: React.FC<GroupProps> = React.memo(({ group }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const editRef = React.useRef<HTMLDivElement>(null);

  return (
    <ListItem
      className={cx(
        itemPadding,
        styles.baseRow,
        styles.groupRow,
        'group odd:bg-white even:bg-gray-100 hover:bg-gray-200 py-3 w-auto items-center',
      )}
    >
      <div
        className={cx('rounded h-4 w-4', styles.indicator)}
        style={{ backgroundColor: getGroupColor(group.color) }}
      />
      <Link
        variant="body1"
        className={styles.name}
        color="inherit"
        component={RouterLink}
        to={`/library/?group=${group.id}`}
      >
        {group.name}
      </Link>
      <Typography className={cx(styles.date, 'text-gray-800')}>{moment.utc(group.created_at).format('MMM DD, YYYY')}</Typography>
      <Typography className={styles.numPapers}>{group.num_papers}</Typography>
      <div className={cx(styles.edit, 'hidden group-hover:flex')} ref={editRef}>
        <IconButton
          aria-label="Open"
          onClick={() => {
            setIsEditOpen(true);
          }}
          size="small"
          className="p-1"
        >
          <CreateIcon fontSize="small" />
        </IconButton>
      </div>
      <PopoverMenu
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        anchorEl={editRef.current}
        placement="bottom-end"
        contentCss={css`
          width: 230px;
        `}
      >
        <EditGroup group={group} onFinishEdit={() => setIsEditOpen(false)} />
      </PopoverMenu>
    </ListItem>
  );
});
