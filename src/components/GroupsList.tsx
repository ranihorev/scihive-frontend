/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import copy from 'clipboard-copy';
import * as queryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Dispatch } from 'redux';
import useReactRouter from 'use-react-router';
import { actions } from '../actions';
import { Group, RootState } from '../models';
import { presets } from '../utils';

const iconCss = css`
  font-size: 16px;
`;

interface GroupsModalProps {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
}

const Groups: React.FC<GroupsModalProps> = ({ groups, setGroups }) => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = React.useState(false);
  const { history, location } = useReactRouter();

  const handleDeleteGroup = (id: string) => {
    axios
      .delete('/groups/group', { params: { id } })
      .then(res => {
        const newQ = { ...queryString.parse(location.search) };
        delete newQ.group;
        history.push({
          pathname: location.pathname,
          search: queryString.stringify(newQ),
        });
        setGroups(res.data);
      })
      .catch(e => console.warn(e.message));
  };

  const handleShare = (id: string) => {
    copy(`${window.location.origin}${window.location.pathname}?group=${id}`);
    toast.info(`Link was copied to clipboard`, { autoClose: 2000 });
  };

  const handleSubmitNewGroup = (event: React.FormEvent) => {
    setIsSubmitDisabled(true);
    event.preventDefault();
    axios
      .post('/groups/group', { name: newGroupName })
      .then(res => {
        setGroups(res.data);
        setNewGroupName('');
      })
      .catch(e => console.warn(e.message))
      .finally(() => setIsSubmitDisabled(false));
  };

  return (
    <div css={presets.col}>
      <Typography
        variant="h5"
        css={css`
          margin-top: 10px;
          margin-bottom: 15px;
        `}
      >
        Manage your groups
      </Typography>
      <div>
        <Typography>
          Groups allow you to manage lists of papers and share comments with an exclusive team of peers
        </Typography>
        <form
          onSubmit={handleSubmitNewGroup}
          css={css`
            margin-top: 32px;
            margin-bottom: 12px;
            display: inline-flex;
            width: 100%;
            max-width: 400px;
          `}
        >
          <TextField
            type="text"
            name="name"
            placeholder="Your new group"
            value={newGroupName}
            onChange={event => setNewGroupName(event.target.value)}
            fullWidth
            required
            css={css`
              margin-right: 12px;
            `}
          />
          <Button type="submit" variant="contained" color="primary" size="small" disabled={isSubmitDisabled}>
            Create
          </Button>
        </form>
        <List>
          {groups.map(group => (
            <ListItem key={group.id} disableGutters>
              <ListItemText>{group.name}</ListItemText>
              <ListItemSecondaryAction>
                <IconButton aria-label="Share" onClick={() => handleShare(group.id)}>
                  <i className="fas fa-share-alt" css={iconCss} />
                </IconButton>
                <IconButton aria-label="Delete" onClick={() => handleDeleteGroup(group.id)}>
                  <i className="far fa-trash-alt" css={iconCss} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state;
  return {
    groups: user.groups,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setGroups: (groups: Group[]) => {
      dispatch(actions.setGroups(groups));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Groups);
