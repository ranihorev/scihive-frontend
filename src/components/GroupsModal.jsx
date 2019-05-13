/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React from 'react';
import {connect} from "react-redux";
import axios from 'axios';
import {
  List,
  ListItem,
  TextField,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  Button,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  withStyles,
  withMobileDialog
} from "@material-ui/core";
import {compose} from "redux";
import {withRouter} from "react-router";
import * as queryString from "query-string";
import * as copy from 'clipboard-copy';
import {toast} from "react-toastify";
import {actions} from "../actions";


const styles = () => ({
  faIcon: {
    fontSize: '16px',
  },
  form: {
    marginTop: '32px',
    marginBottom: '12px',
    display: 'inline-flex',
    width: '100%',
  },
  newGroupInput: {
    marginRight: '12px',
  },
  submitButton: {
  },
  groupButton: {
    textTransform: 'none',
  }
});


const GroupsModal = ({classes, location, history, isGroupsModalOpen, toggleGroupsModal, fullScreen,
                       selectGroup, selectedGroup, groups, setGroups }) => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = React.useState(false);

  const handleDeleteGroup = id => {
    axios.delete('/groups/group', {params: {id}})
      .then( res => {
        const newQ = {...queryString.parse(location.search)};
        delete newQ.group;
        history.push({
          pathname: location.pathname,
          search: queryString.stringify(newQ)
        });
        setGroups(res.data);
      })
      .catch(e => console.warn(e.message));
  };

  const handleShare = id => {
    copy(`${window.location.origin}${window.location.pathname}?group=${id}`);
    toast.info(`Link was copied to clipboard`, {autoClose: 2000});
  };

  const handleSubmitNewGroup = (event) => {
    setIsSubmitDisabled(true);
    event.preventDefault();
    axios.post('/groups/group', {name: newGroupName})
      .then(res => {
        setGroups(res.data);
        setNewGroupName('');
      })
      .catch(e => console.warn(e.message))
      .finally(() => setIsSubmitDisabled(false));
  };

  const switchToGroup = (groupData) => {
    const newQ = {...queryString.parse(location.search), group: groupData ? groupData.id : undefined};
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ)
    });
    selectGroup(groupData);
    // auto close the modal after selection
    setTimeout(() => toggleGroupsModal(), 400);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isGroupsModalOpen}
      onClose={toggleGroupsModal}
      disableBackdropClick
      maxWidth="md"
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle>Manage your groups</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Groups allow you to share comments with an exclusive team of peers
        </DialogContentText>
        <form className={classes.form} onSubmit={handleSubmitNewGroup}>
          <TextField
            type="text"
            name="name"
            placeholder="Your new group"
            className={classes.newGroupInput}
            value={newGroupName}
            onChange={event => setNewGroupName(event.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            className={classes.submitButton}
            disabled={isSubmitDisabled}
          >
            Create
          </Button>

        </form>
        <List>
            {groups && groups.map(group => (
              <ListItem key={group.id} disableGutters selected={selectedGroup && group.id === selectedGroup.id}>
                <ListItemText >
                  <Button className={classes.groupButton} onClick={() => switchToGroup(group)}>
                    {group.name}
                  </Button>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton aria-label="Share" onClick={() => handleShare(group.id)}>
                    <i className={`fas fa-share-alt ${classes.faIcon}`}></i>
                  </IconButton>
                  <IconButton aria-label="Delete" onClick={() => handleDeleteGroup(group.id)}>
                    <i className={`far fa-trash-alt ${classes.faIcon}`}></i>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions css={css`
        justify-content: space-between;
      `}>
        <Button onClick={() => switchToGroup(undefined)} color="primary">
          Back to Public
        </Button>
        <Button onClick={toggleGroupsModal} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
};

const mapStateToProps = (state) => {
  const {user} = state;
  return {
    isGroupsModalOpen: user.isGroupsModalOpen,
    selectedGroup: user.selectedGroup,
    groups: user.groups,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleGroupsModal: () => {
      dispatch(actions.toggleGroupsModal());
    },
    selectGroup: (group) => {
      dispatch(actions.selectGroup(group));
    },
    setGroups: (groups) => {
      dispatch(actions.setGroups(groups));
    },
  }
};

const withRedux = connect(mapStateToProps, mapDispatchToProps);
const withMobile = withMobileDialog();

export default compose(withRedux, withStyles(styles), withMobile, withRouter)(GroupsModal);
