/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  withMobileDialog,
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

const iconCss = css`
  font-size: 16px;
`;

interface GroupsModalProps {
  isGroupsModalOpen: boolean;
  toggleGroupsModal: (state?: boolean) => void;
  fullScreen: boolean;
  groups: Group[];
  setGroups: (groups: Group[]) => void;
}

const GroupsModal: React.FC<GroupsModalProps> = ({
  isGroupsModalOpen,
  toggleGroupsModal,
  fullScreen,
  groups,
  setGroups,
}) => {
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
    <Dialog
      fullScreen={fullScreen}
      open={isGroupsModalOpen}
      onClose={() => toggleGroupsModal(false)}
      disableBackdropClick
      maxWidth="md"
    >
      <DialogTitle>Manage your groups</DialogTitle>
      <DialogContent>
        <DialogContentText>Groups allow you to share comments with an exclusive team of peers</DialogContentText>
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
          {groups &&
            groups.map(group => (
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
      </DialogContent>
      <DialogActions
        css={css`
          justify-content: space-between;
        `}
      >
        <Button onClick={() => toggleGroupsModal(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state;
  return {
    isGroupsModalOpen: user.isGroupsModalOpen,
    groups: user.groups,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleGroupsModal: (state?: boolean) => {
      dispatch(actions.toggleGroupsModal(state));
    },
    setGroups: (groups: Group[]) => {
      dispatch(actions.setGroups(groups));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);
const withMobile = withMobileDialog();

export default withRedux(withMobile(GroupsModal));
