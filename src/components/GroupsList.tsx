/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, IconButton, List, ListItem, TextField, Typography, Input } from '@material-ui/core';
import axios from 'axios';
import copy from 'clipboard-copy';
import React from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { actions } from '../actions';
import { Group, RootState } from '../models';
import { deleteGroup, createNewGroup } from '../thunks';
import { presets } from '../utils';

const iconCss = css`
  font-size: 16px;
`;

interface GroupProps extends Omit<GroupsProps, 'groups' | 'createNewGroup'> {
  group: Group;
}

const GroupRender: React.FC<GroupProps> = ({ group, deleteGroup }) => {
  const handleShare = (id: string) => {
    copy(`${window.location.origin}${window.location.pathname}?group=${id}`);
    toast.info(`Link was copied to clipboard`, { autoClose: 2000 });
  };

  return (
    <ListItem disableGutters>
      <div
        css={css`
          ${presets.row};
          align-items: center;
          width: 100%;
        `}
      >
        <div
          css={css`
            flex-grow: 1;
          `}
        >
          <Input
            value={group.name}
            css={css`
              &::before {
                border-bottom: none;
              }
            `}
            fullWidth
          />
        </div>
        <div>
          <IconButton aria-label="Share" onClick={() => handleShare(group.id)}>
            <i className="fas fa-share-alt" css={iconCss} />
          </IconButton>
          <IconButton aria-label="Delete" onClick={() => deleteGroup(group.id)}>
            <i className="far fa-trash-alt" css={iconCss} />
          </IconButton>
        </div>
      </div>
    </ListItem>
  );
};

interface GroupsProps {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  deleteGroup: (id: string) => void;
  createNewGroup: (name: string, finallyCb: () => void) => void;
}

const Groups: React.FC<GroupsProps> = ({ groups, setGroups, deleteGroup, createNewGroup }) => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = React.useState(false);

  const handleSubmitNewGroup = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitDisabled(true);
    if (!isSubmitDisabled) {
      createNewGroup(newGroupName, () => {
        setIsSubmitDisabled(false);
        setNewGroupName('');
      });
    }
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

      <Typography>
        Groups allow you to manage lists of papers and share comments with an exclusive team of peers
      </Typography>
      <div
        css={css`
          width: 100%;
          max-width: 400px;
        `}
      >
        <form
          onSubmit={handleSubmitNewGroup}
          css={css`
            margin-top: 32px;
            margin-bottom: 12px;
            display: inline-flex;
            width: 100%;
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
            <GroupRender key={group.id} {...{ group, setGroups, deleteGroup }} />
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

const mapDispatchToProps = (dispatch: RTDispatch) => {
  return {
    setGroups: (groups: Group[]) => {
      dispatch(actions.setGroups(groups));
    },
    deleteGroup: (id: string) => {
      dispatch(deleteGroup(id));
    },
    createNewGroup: (name: string, finallyCb: () => void) => {
      dispatch(createNewGroup(name, finallyCb));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Groups);
