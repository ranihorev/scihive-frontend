/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, Chip, CircularProgress, Fade, IconButton, Modal, TextField, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { LoginWithGoogle } from '../auth';
import { useHasContactsPermission } from '../auth/utils';
import { usePaperStore } from '../stores/paper';
import styles from './invite.module.css';
import { Spacer } from './utils/Spacer';
import { useQuery, useMutation, queryCache } from 'react-query';
import Axios from 'axios';
import baseStyle from '../base.module.scss';
import GroupAddIcon from '@material-ui/icons/GroupAdd';

interface Suggestion {
  email: string;
  name: string;
}

const loadGoogleAPIClientAsync = async () => {
  return new Promise((resolve, reject) => {
    window.gapi.load('client', err => (err ? reject(err) : resolve()));
  });
};

const loadContactSuggestions = async (query: string): Promise<Suggestion[]> => {
  await loadGoogleAPIClientAsync();
  const {
    result: {
      feed: { entry },
    },
  } = await window.gapi.client.request({
    method: 'GET',
    path: '/m8/feeds/contacts/default/full',
    params: {
      alt: 'json',
      'max-results': 8,
      q: query,
    },
  });
  if (isEmpty(entry)) return [];

  const options = entry.map((t: any) => {
    const name = t.title && t.title['$t'];
    const email = t['gd$email'] && t['gd$email'][0] && t['gd$email'][0].address;
    if (name && email) {
      return { email, name };
    }
    return null;
  });

  return options.filter((option: Suggestion | null) => option !== null);
};

const EmailsInput: React.FC = React.memo(() => {
  const hasPermission = useHasContactsPermission();
  const [, setRefreshKey] = React.useState(0); // We need to refresh the view on login success

  const [options, setOptions] = React.useState<Suggestion[]>([]);
  const [selected, setSelected] = React.useState<Suggestion[]>([]);
  // We need to ignore old in-flight requests, therefore, we keep track of the response and request ids
  const requestId = React.useRef(0);
  const responseId = React.useRef(0);
  const [isLoading, setIsLoading] = React.useState(false);
  return hasPermission ? (
    <Autocomplete
      multiple
      filterSelectedOptions
      getOptionLabel={option => `${option.name} <${option.email}>`}
      options={[...selected, ...options]}
      onChange={(_, suggestions) => {
        setSelected(suggestions);
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip key={option.email} size="small" label={option.name} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField
          {...params}
          label="Type name or email"
          variant="outlined"
          onChange={async e => {
            const currentRequestId = requestId.current;
            requestId.current += 1;
            setIsLoading(true);
            const newSuggestions = await loadContactSuggestions(e.target.value);
            if (responseId.current > currentRequestId) return; // We already processed a newer request
            setOptions(newSuggestions);
            setIsLoading(false);
            responseId.current = currentRequestId;
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  ) : (
    <div css={{ display: 'flex', justifyContent: 'center' }}>
      <LoginWithGoogle
        onSuccess={() => {
          setRefreshKey(state => state + 1);
        }}
      />
    </div>
  );
});

const GET_PERMISSIONS_Q = 'currentPermissions';

const Permissions: React.FC = React.memo(() => {
  const paperId = usePaperStore(state => state.id);
  const { data } = useQuery(
    GET_PERMISSIONS_Q,
    async () => {
      const res = await Axios.get<{
        author: { first_name?: string; last_name?: string; username: string; email: string };
      }>(`/collab/paper/${paperId}/invite`);
      return res.data;
    },
    { staleTime: 5000 },
  );

  const [removePermission] = useMutation(
    (props: { email: string }) => {
      return Axios.delete('');
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
      <Typography variant="h6">Current Collaborators</Typography>
      <Spacer size={12} />
      <Chip
        label={`${data.author.first_name} ${data.author.last_name}`}
        color="default"
        onDelete={() => {
          removePermission({ email: data.author.email });
        }}
      />
    </div>
  );
});

export const Invite: React.FC = React.memo(() => {
  const { title, isInviteOpen, setIsInviteOpen } = usePaperStore(
    state => pick(state, ['title', 'isInviteOpen', 'setIsInviteOpen']),
    shallow,
  );
  const [inviteText, setInviteText] = React.useState(`Check out this paper I'm reading - ${title}`);
  return (
    <Modal
      disableBackdropClick
      open={isInviteOpen}
      onClose={() => {
        setIsInviteOpen(false);
      }}
    >
      <Fade in={isInviteOpen}>
        <div className={baseStyle.modal} style={{ width: 600 }}>
          <div className={styles.close}>
            <IconButton size="small" onClick={() => setIsInviteOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <div className={baseStyle.centeredRow}>
            <GroupAddIcon color="primary" fontSize="large" />
            <Spacer size={12} />
            <Typography align="left" variant="h5">
              Invite collaborators to discuss this paper
            </Typography>
          </div>
          <Spacer size={20} />
          <EmailsInput />
          <Spacer size={16} />
          <TextField
            multiline
            fullWidth
            label="Add Message"
            variant="outlined"
            rows={3}
            value={inviteText}
            onChange={e => setInviteText(e.target.value)}
          />
          <Spacer size={12} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              toast.success('Invites Sent!', { autoClose: 5000 });
            }}
            css={{ alignSelf: 'center' }}
          >
            Invite
          </Button>
          <Permissions />
        </div>
      </Fade>
    </Modal>
  );
});
