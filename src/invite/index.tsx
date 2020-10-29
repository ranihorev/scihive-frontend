/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  Button,
  Chip,
  CircularProgress,
  Fade,
  IconButton,
  Link,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Axios from 'axios';
import { isEmpty, pick, uniqBy } from 'lodash';
import React from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { useHasContactsPermission, useLogInViaGoogle } from '../auth/utils';
import baseStyle from '../base.module.scss';
import { usePaperStore } from '../stores/paper';
import { isAxiosError, isValidEmailAddress } from '../utils';
import { Spacer } from '../utils/Spacer';
import { CurrentCollaborators, GET_PERMISSIONS_Q } from './CurrentCollaborators';
import { ShareLink } from './ShareLink';

interface Suggestion {
  email: string;
  name?: string;
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

const GooglePermissions: React.FC<{ isLoggedInGoogle: boolean; grantPermissions?: () => void }> = ({
  isLoggedInGoogle,
  grantPermissions,
}) => {
  const { signIn } = useLogInViaGoogle();
  return (
    <div className="bg-gray-200 p-3 rounded mb-3">
      <Typography>
        Easily invite collaborators by{' '}
        <Link
          href="#"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            if (isLoggedInGoogle) {
              grantPermissions?.();
            } else {
              signIn();
            }
          }}
        >
          {isLoggedInGoogle ? 'allowing access to your Google contacts' : 'connecting your Google account'}
        </Link>
        .
      </Typography>
      <Typography>No worries, your contacts will only be used locally on your computer.</Typography>
    </div>
  );
};

interface EmailsInputProps {
  selected: Suggestion[];
  setSelected: React.Dispatch<Suggestion[]>;
}

const EmailsInput: React.FC<EmailsInputProps> = React.memo(({ selected, setSelected }) => {
  const [inputValue, setInputValue] = React.useState('');
  const { isLoggedInGoogle, hasPermissions, grantPermissions } = useHasContactsPermission();
  const { data: options, isLoading } = useQuery(
    `LOAD_SUGGESTIONS_Q_${inputValue}`,
    () => {
      return loadContactSuggestions(inputValue);
    },
    { refetchOnWindowFocus: false, initialData: [], keepPreviousData: true, enabled: hasPermissions },
  );

  return (
    <React.Fragment>
      <GooglePermissions {...{ isLoggedInGoogle, grantPermissions }} />
      <Autocomplete
        multiple
        selectOnFocus
        handleHomeEndKeys
        freeSolo
        filterOptions={options => {
          // Remove selected from options
          const selectedEmails = new Set(selected.map(user => user.email));
          return options.filter(option => !selectedEmails.has(option.email));
        }}
        getOptionLabel={option => `${option.name} <${option.email}>`}
        options={[...selected, ...(options || [])]}
        value={selected}
        onChange={(_, newValues) => {
          const newSelected: Suggestion[] = newValues.map(value =>
            typeof value === 'string' ? { email: value } : value,
          );
          // Ensure that we have unique emails
          setSelected(uniqBy(newSelected, 'email'));
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Tooltip key={option.email} title={option.email} placement="top" arrow>
              <Chip size="small" label={option.name || option.email} {...getTagProps({ index })} />
            </Tooltip>
          ))
        }
        onBlur={() => {
          if (inputValue && isValidEmailAddress(inputValue)) {
            setSelected(uniqBy([...selected, { email: inputValue }], 'email'));
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            label="Type name or email"
            variant="outlined"
            onChange={async e => {
              setInputValue(e.target.value);
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
    </React.Fragment>
  );
});

export const Invite: React.FC = React.memo(() => {
  const { id: paperId, title, isInviteOpen, setIsInviteOpen, isEditable } = usePaperStore(
    state => pick(state, ['id', 'title', 'isInviteOpen', 'setIsInviteOpen', 'isEditable']),
    shallow,
  );
  const [newUsers, setNewUsers] = React.useState<Suggestion[]>([]);
  const [inviteText, setInviteText] = React.useState(`Check out this paper I'm reading - ${title}`);
  const [submitInvites, { isLoading, reset }] = useMutation(
    () => {
      return Axios.post(`/paper/${paperId}/invite`, { message: inviteText, users: newUsers });
    },
    {
      onSuccess: () => {
        toast.success('Invites Sent!', { autoClose: 10000 });
        queryCache.invalidateQueries(GET_PERMISSIONS_Q);
        setNewUsers([]);
      },
      onError: e => {
        let reason = '';
        if (isAxiosError(e)) {
          reason = e.response?.data.message;
        }
        toast.error(
          <div className="p-2">
            <div>Failed to send invites :(</div>
            {reason && <div className="text-sm mt-2">Reason: {JSON.stringify(reason)}</div>}
          </div>,
          {
            autoClose: 5000,
          },
        );
      },
    },
  );
  if (!paperId) return null;

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
          <div className="absolute right-0 top-0 mr-1 mt-1">
            <IconButton size="small" onClick={() => setIsInviteOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="flex flex-row items-center">
            <GroupAddIcon color="primary" fontSize="large" className="mr-2" />
            <Typography align="left" className="text-lg font-medium">
              Invite Collaborators
            </Typography>
          </div>
          <Spacer size={20} />
          <EmailsInput selected={newUsers} setSelected={setNewUsers} />
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
            disabled={isLoading}
            variant="contained"
            color="primary"
            onClick={async () => {
              if (isEmpty(newUsers)) {
                toast.error('Please enter valid email addresses.');
              } else {
                reset();
                submitInvites();
              }
            }}
            className="self-center px-8"
          >
            Invite
          </Button>

          {isEditable ? (
            <React.Fragment>
              <Spacer size={16} />
              <CurrentCollaborators />
              <Spacer size={16} />
              <ShareLink paperId={paperId} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Spacer size={16} />
              <Typography>
                <b>Warning:</b> This paper is public
              </Typography>
            </React.Fragment>
          )}
        </div>
      </Fade>
    </Modal>
  );
});
