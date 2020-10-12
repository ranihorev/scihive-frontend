import React from 'react';
import { Typography, Switch, Button, Tooltip, Link, TextField } from '@material-ui/core';
import { useQuery, useMutation, queryCache } from 'react-query';
import Axios from 'axios';
import LinkIcon from '@material-ui/icons/Link';
import copy from 'clipboard-copy';

const CopyButton: React.FC<{ link: string }> = ({ link }) => {
  const [copied, setCopied] = React.useState(false);
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    return () => {
      timeoutId.current && clearTimeout(timeoutId.current);
    };
  }, []);
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    copy(link);
    setCopied(true);
    timeoutId.current && clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-row items-center">
      <Link href="#" onClick={onClick} className="truncate text-sm col-span-2 mr-2" color="textSecondary">
        {link}
      </Link>
      <Tooltip title="Copied to clipboard!" open={copied} placement="top" color="primary">
        <Button onClick={onClick} className="whitespace-no-wrap flex-shrink-0" size="small">
          Copy Link
        </Button>
      </Tooltip>
    </div>
  );
};

export const ShareLink: React.FC<{ paperId: string }> = ({ paperId }) => {
  const requestURL = `/paper/${paperId}/token`;
  const queryKey = ['ShareLink', { paperId }];
  const { data } = useQuery(queryKey, async () => {
    const response = await Axios.get<{ token?: string }>(requestURL);
    return response.data;
  });

  const [updateLinkSharing] = useMutation(
    async (enable: boolean) => {
      const response = await Axios.post<{ enable: boolean }>(requestURL, { enable });
      return response.data;
    },
    {
      onSuccess: token => {
        queryCache.setQueryData(queryKey, () => token);
      },
    },
  );

  const token = data?.token;
  let shareLink: URL | undefined = undefined;
  if (token) {
    shareLink = new URL(`/paper/${paperId}`, window.location.origin);
    shareLink.searchParams.append('token', token);
  }
  return (
    <React.Fragment>
      <div className="pt-2 pb-1 flex flex-row items-center">
        <LinkIcon className="mr-2" />
        <Typography className="mr-1 leading-4">Create Link</Typography>
        <Switch
          checked={Boolean(token)}
          onChange={e => {
            updateLinkSharing(e.target.checked);
          }}
          color="primary"
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
      </div>
      <div className="h-8">
        {shareLink ? (
          <CopyButton link={shareLink.href} />
        ) : (
          <Typography color="textSecondary" className="text-sm pt-1">
            Anyone with the link can view this paper
          </Typography>
        )}
      </div>
    </React.Fragment>
  );
};
