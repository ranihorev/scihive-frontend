/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, List, ListItem, Typography } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import cx from 'classnames';
import Color from 'color';
import { isEmpty } from 'lodash';
import React from 'react';
import { Group } from '../models';
import { filterGroups } from '../utils';
import { BASE_GROUP_COLOR, GROUP_COLORS, pickRandomColor } from '../utils/presets';
import { OnSelectGroupProps, useCreateGroup, useFetchGroups } from '../utils/useGroups';
import { NewGroup } from './NewGroup';
import styles from './styles.module.scss';

interface GroupRenderProps {
  group: Group;
  selected: boolean;
  paperId: string;
  onSelect: (props: OnSelectGroupProps) => void;
  onEdit: () => void;
}

const GroupRender: React.FC<GroupRenderProps> = ({ group, selected, paperId, onSelect, onEdit }) => {
  let backgroundHoverColor;
  const backgroundColor = GROUP_COLORS[group.color || BASE_GROUP_COLOR];
  try {
    backgroundHoverColor = Color(backgroundColor);
  } catch (e) {
    backgroundHoverColor = Color(GROUP_COLORS[BASE_GROUP_COLOR]);
  }
  backgroundHoverColor = backgroundHoverColor.darken(0.1).string();

  return (
    <ListItem key={group.id} className={styles.groupRoot}>
      <div
        className={styles.groupInfo}
        css={css`
          background-color: ${backgroundColor};
          &:hover {
            background-color: ${backgroundHoverColor};
          }
        `}
        onClick={async () => {
          onSelect({ groupId: group.id, shouldAdd: !selected });
        }}
      >
        <Typography variant="body2" className={styles.groupName}>
          {group.name}
        </Typography>
        {selected && <DoneIcon fontSize="small" className={styles.groupSelected} />}
      </div>
      <div className={cx(styles.editGroupButton, 'ml-1')} onClick={() => onEdit()}>
        <CreateIcon fontSize="small" />
      </div>
    </ListItem>
  );
};

interface GroupListProps {
  onSelectGroup: (props: OnSelectGroupProps) => void;
  paperId: string;
  selectedGroupIds: string[];
  setGroupInEdit: React.Dispatch<Group | undefined>;
}

export const GroupsList: React.FC<GroupListProps> = ({ selectedGroupIds, onSelectGroup, setGroupInEdit, paperId }) => {
  const [newGroupValue, setNewGroupValue] = React.useState('');

  const [createGroup] = useCreateGroup();

  const submitGroup = async () => {
    if (isEmpty(newGroupValue)) return;
    const response = await createGroup({ name: newGroupValue, color: pickRandomColor(), paperId });
    setNewGroupValue('');
    if (response) {
      onSelectGroup({ groupId: response.new_id, shouldAdd: true });
    }
  };

  const { groups } = useFetchGroups(true);
  const filteredGroups = filterGroups(groups, newGroupValue);

  return (
    <React.Fragment>
      <NewGroup value={newGroupValue} setValue={setNewGroupValue} submitGroup={submitGroup} />
      {filteredGroups.length > 0 && (
        <List dense className={styles.groupsList}>
          {filteredGroups.map(group => {
            const selected = selectedGroupIds.some(id => id === group.id);
            return (
              <GroupRender
                key={group.id}
                {...{ group, paperId, selected }}
                onSelect={onSelectGroup}
                onEdit={() => setGroupInEdit(group)}
              />
            );
          })}
        </List>
      )}
      {newGroupValue && (
        <ListItem>
          <Button variant="outlined" style={{ textTransform: 'none' }} fullWidth onClick={submitGroup}>
            Create &quot;{newGroupValue}&quot;
          </Button>
        </ListItem>
      )}
    </React.Fragment>
  );
};
