/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, List, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import baseStyles from '../../base.module.scss';
import { pickRandomColor } from '../../utils/presets';
import { TopBar } from '../topBar';
import { Spacer } from '../utils/Spacer';
import { useCreateGroup, useFetchGroups } from '../utils/useGroups';
import { GroupRender } from './Group';
import styles from './styles.module.scss';

const GroupsList: React.FC = () => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const groups = useFetchGroups();
  const [createNewGroup, { isLoading }] = useCreateGroup();

  const handleSubmitNewGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    await createNewGroup({ name: newGroupName, color: pickRandomColor() });
    setNewGroupName('');
  };

  return (
    <div className={styles.groupsListRoot}>
      <form onSubmit={handleSubmitNewGroup} className={styles.newGroupForm}>
        <TextField
          type="text"
          name="name"
          placeholder="Your new collection"
          value={newGroupName}
          onChange={event => setNewGroupName(event.target.value)}
          fullWidth
          required
          css={css`
            margin-right: 12px;
          `}
        />
        <Button type="submit" variant="contained" color="primary" size="small" disabled={isLoading}>
          Create
        </Button>
      </form>
      <Spacer size={12} />
      <List>
        {groups.map(group => (
          <GroupRender key={group.id} group={group} />
        ))}
      </List>
    </div>
  );
};

export const Groups: React.FC = () => {
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          <Button component={RouterLink} to="/collab/library" color="inherit">
            Library
          </Button>
        }
      />
      <div className={baseStyles.basePage}>
        <Spacer size={24} />
        <Typography variant="h4">My Collections</Typography>
        <Spacer size={12} />
        <Typography>Collections allow you to organize papers and share comments with groups of peers.</Typography>
        <Spacer size={32} />
        <GroupsList />
      </div>
    </div>
  );
};
