/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton, ListItem } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { EditGroup } from '../bookmark/EditGroup';
import { Group } from '../models';
import { presets } from '../utils';
import { PopoverMenu } from '../utils/PopoverMenu';
import { getGroupColor } from '../utils/presets';
import styles from './styles.module.scss';

interface GroupProps {
  group: Group;
}

export const GroupRender: React.FC<GroupProps> = ({ group }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const editRef = React.useRef<HTMLDivElement>(null);

  return (
    <ListItem disableGutters className={styles.group}>
      <div className={styles.groupColor} style={{ backgroundColor: getGroupColor(group.color) }} />
      <div
        css={css`
          flex-grow: 1;
          line-height: 1;
        `}
      >
        <RouterLink to={`/library/?group=${group.id}`} css={[presets.simpleLinkWithHover]}>
          {group.name}
        </RouterLink>
      </div>
      <div css={presets.row}>
        <div ref={editRef}>
          <IconButton
            aria-label="Open"
            onClick={() => {
              setIsEditOpen(true);
            }}
            size="small"
          >
            <CreateIcon fontSize="small" />
          </IconButton>
        </div>
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
};
