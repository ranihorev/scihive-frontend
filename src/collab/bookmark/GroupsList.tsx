/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, List, ListItem, Typography } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import Color from 'color';
import { isEmpty } from 'lodash';
import React from 'react';
import { Group } from '../../models';
import { BASE_GROUP_COLOR, GROUP_COLORS, pickRandomColor } from '../../utils/presets';
import { useAddOrRemovePaperToGroup, useCreateGroup, useFetchGroups } from '../utils/useGroups';
import { NewGroup } from './NewGroup';
import styles from './styles.module.scss';

interface GroupRenderProps {
  group: Group;
  selected: boolean;
  paperId: string;
  updatePaperGroup: (groups: string[]) => void;
  onEdit: () => void;
}

const GroupRender: React.FC<GroupRenderProps> = ({ group, selected, paperId, updatePaperGroup, onEdit }) => {
  let backgroundHoverColor;
  const backgroundColor = GROUP_COLORS[group.color || BASE_GROUP_COLOR];
  try {
    backgroundHoverColor = Color(backgroundColor);
  } catch (e) {
    backgroundHoverColor = Color(GROUP_COLORS[BASE_GROUP_COLOR]);
  }
  backgroundHoverColor = backgroundHoverColor.darken(0.1).string();
  const addRemoveGroup = useAddOrRemovePaperToGroup();

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
          const paperGroups = await addRemoveGroup({ paperId, groupId: group.id, shouldAdd: !selected });
          if (paperGroups) {
            updatePaperGroup(paperGroups.map(g => g.id));
          }
        }}
      >
        <Typography variant="body2" className={styles.groupName}>
          {group.name}
        </Typography>
        {selected && <DoneIcon fontSize="small" className={styles.groupSelected} />}
      </div>
      <div className={styles.editGroupButton} onClick={() => onEdit()}>
        <CreateIcon fontSize="small" />
      </div>
    </ListItem>
  );
};

interface GroupListProps {
  updatePaperGroup: (groups: string[]) => void;
  paperId: string;
  selectedGroupIds: string[];
  setGroupInEdit: React.Dispatch<Group | undefined>;
}

export const GroupsList: React.FC<GroupListProps> = ({
  selectedGroupIds,
  updatePaperGroup,
  setGroupInEdit,
  paperId,
}) => {
  const [newGroupValue, setNewGroupValue] = React.useState('');

  const [createGroup] = useCreateGroup();

  const submitGroup = async () => {
    if (isEmpty(newGroupValue)) return;
    const response = await createGroup({ name: newGroupValue, color: pickRandomColor(), paperId });
    setNewGroupValue('');
    if (response) {
      updatePaperGroup(response.groups.map(g => g.id));
    }
  };

  const groups = useFetchGroups();

  const filteredGroups = groups.filter(group => new RegExp(`^${newGroupValue}`, 'i').test(group.name));

  return (
    <React.Fragment>
      <NewGroup value={newGroupValue} setValue={setNewGroupValue} submitGroup={submitGroup} />
      {filteredGroups.length > 0 && (
        <List
          dense
          css={css`
            max-height: 250px;
            overflow-y: auto;
            width: 100%;
            padding-top: 4px;
          `}
        >
          {filteredGroups.map(group => {
            const selected = selectedGroupIds.some(id => id === group.id);
            return (
              <GroupRender
                key={group.id}
                {...{ group, paperId, selected, updatePaperGroup }}
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
