import { Chip, Typography } from '@material-ui/core';
import Axios from 'axios';
import React from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import { usePaperStore } from '../stores/paper';
import { Spacer } from '../utils/Spacer';
import styles from './invite.module.css';

interface User {
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
}

const userToName = (user: User) => {
  if (user.first_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username;
};

export const GET_PERMISSIONS_Q = 'currentPermissions';

export const CurrentCollaborators: React.FC = React.memo(() => {
  const paperId = usePaperStore(state => state.id);
  const { data } = useQuery(
    GET_PERMISSIONS_Q,
    async () => {
      const res = await Axios.get<{
        author: User;
        users: User[];
      }>(`/paper/${paperId}/invite`);
      return res.data;
    },
    { staleTime: 5000 },
  );

  const [removePermission] = useMutation(
    (props: { email: string }) => {
      return Axios.delete(`/paper/${paperId}/invite`, { data: props });
    },
    {
      onSuccess: () => {
        // Query Invalidations
        queryCache.invalidateQueries(GET_PERMISSIONS_Q);
      },
    },
  );

  if (!data) return null;
  return (
    <div>
      <Typography variant="h6" className="pt-2 pb-3">
        Current Collaborators
      </Typography>
      {data.author && <Chip label={userToName(data.author)} color="primary" className={styles.chip} />}
      {data.users.map(user => (
        <Chip
          className={styles.chip}
          key={user.email}
          label={userToName(user)}
          color="default"
          onDelete={() => {
            removePermission({ email: user.email });
          }}
        />
      ))}
    </div>
  );
});
