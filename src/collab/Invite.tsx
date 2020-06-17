/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Modal, Fade, Typography, TextField, CircularProgress, Chip } from '@material-ui/core';
import { presets } from '../utils';
import { useHasContactsPermission } from '../auth/utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { LoginWithGoogle } from '../auth';
import { isEmpty } from 'lodash';
import { Spacer } from './utils/Spacer';

interface Suggestion {
  email: string;
  name: string;
}

const loadGoogleAPIClientAsync = async () => {
  return new Promise((resolve, reject) => {
    gapi.load('client', err => (err ? reject(err) : resolve()));
  });
};

const loadContactSuggestions = async (query: string): Promise<Suggestion[]> => {
  await loadGoogleAPIClientAsync();
  const {
    result: {
      feed: { entry },
    },
  } = await gapi.client.request({
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

export const Invite: React.FC<{ isOpen: boolean; setIsOpen: React.Dispatch<boolean> }> = ({ isOpen, setIsOpen }) => {
  const hasPermission = useHasContactsPermission();
  const [options, setOptions] = React.useState<Suggestion[]>([]);
  const [selected, setSelected] = React.useState<Suggestion[]>([]);
  const requestId = React.useRef(0);
  const responseId = React.useRef(0);
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Modal
      disableBackdropClick
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <Fade in={isOpen}>
        <div css={[presets.modalCss, { width: 600 }]}>
          <Typography align="center">Invite collaborators to read and discuss the paper with you</Typography>
          <Spacer size={16} />
          {hasPermission ? (
            <Autocomplete
              multiple
              filterSelectedOptions
              getOptionLabel={option => `${option.name} <${option.email}>`}
              options={[...selected, ...options]}
              onChange={(_, suggestions) => {
                setSelected(suggestions);
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} />)
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
            <div>
              <LoginWithGoogle
                onSuccess={resp => {
                  console.log(resp);
                }}
              />
            </div>
          )}
        </div>
      </Fade>
    </Modal>
  );
};
