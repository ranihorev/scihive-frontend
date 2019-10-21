/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, IconButton, List, ListItem, TextField, Typography } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import copy from 'clipboard-copy';
import Color from 'color';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actions } from '../actions';
import { Group, RootState } from '../models';
import { createNewGroup, deleteGroup, editGroup } from '../thunks';
import { presets } from '../utils';
import { getGroupColor, GroupColor, GROUP_COLORS } from '../utils/presets';
import { PopoverMenu } from './PopoverMenu';

const iconCss = css`
  font-size: 16px;
`;

interface EditGroupProps {
  group: Group;
  editGroup: (...args: Parameters<typeof editGroup>) => void;
  onFinishEdit: () => void;
}

export const EditGroup: React.FC<EditGroupProps> = ({ group, editGroup, onFinishEdit }) => {
  const colorMargin = 10;
  const [name, setName] = React.useState(group.name);
  const [selectedColor, setSelectedColor] = React.useState<GroupColor | undefined>(group.color);
  return (
    <div
      css={css`
        padding: 10px;
      `}
    >
      <div>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          margin="normal"
          error={name === ''}
          css={css`
            margin-top: 0;
          `}
          fullWidth
          autoFocus
        />
      </div>
      <div
        css={css`
          ${presets.row};
          flex-wrap: wrap;
          margin-left: ${-1 * colorMargin}px;
          margin-top: ${-1 * colorMargin}px;
        `}
      >
        {Object.keys(GROUP_COLORS).map(colorName => {
          const currentColor = GROUP_COLORS[colorName as GroupColor];
          const hoverColor = Color(currentColor)
            .darken(0.1)
            .string();
          return (
            <div
              key={colorName}
              css={css`
                width: 60px;
                height: 27px;
                margin-top: ${colorMargin}px;
                margin-left: ${colorMargin}px;
                border-radius: 4px;
                ${presets.row};
                ${presets.centered};
                background-color: ${currentColor};
                cursor: pointer;
                &:hover {
                  background-color: ${hoverColor};
                }
              `}
              onClick={() => setSelectedColor(colorName as GroupColor)}
            >
              {selectedColor === colorName && <DoneIcon />}
            </div>
          );
        })}
      </div>
      <div
        css={css`
          ${presets.row};
          margin-top: 20px;
          justify-content: space-evenly;
        `}
      >
        <Button
          variant="outlined"
          color="primary"
          size="small"
          css={css`
            width: 75px;
          `}
          onClick={async () => {
            if (name === '') return;
            await editGroup(group.id, { name, color: selectedColor });
            onFinishEdit();
          }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          css={css`
            width: 75px;
          `}
          onClick={() => onFinishEdit()}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

interface GroupProps extends Omit<GroupsProps, 'groups' | 'createNewGroup'> {
  group: Group;
}

const GroupRender: React.FC<GroupProps> = ({ group, deleteGroup, editGroup }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const editRef = React.useRef<HTMLDivElement>(null);
  const handleShare = (id: string) => {
    copy(`${window.location.origin}/list/${group.id}/`);
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
            width: 15px;
            height: 15px;
            border-radius: 3px;
            margin-right: 6px;
          `}
          style={{ backgroundColor: getGroupColor(group.color) }}
        />
        <div
          css={css`
            flex-grow: 1;
          `}
        >
          {group.name}
        </div>
        <div css={presets.row}>
          <div ref={editRef}>
            <IconButton
              aria-label="Open"
              onClick={() => {
                setIsEditOpen(true);
              }}
            >
              <i className="fas fa-pencil-alt" css={iconCss} />
            </IconButton>
          </div>
          <Link to={`/list/${group.id}/`}>
            <IconButton aria-label="Open">
              <i className="fas fa-external-link-square-alt" css={iconCss} />
            </IconButton>
          </Link>
          <IconButton aria-label="Share" onClick={() => handleShare(group.id)}>
            <i className="fas fa-share-alt" css={iconCss} />
          </IconButton>
          <IconButton aria-label="Delete" onClick={() => deleteGroup(group.id)}>
            <i className="far fa-trash-alt" css={iconCss} />
          </IconButton>
        </div>
        <PopoverMenu
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          anchorEl={editRef.current}
          placement="bottom-end"
          contentCss={css`
            width: 230px;
          `}
        >
          <EditGroup editGroup={editGroup} group={group} onFinishEdit={() => setIsEditOpen(false)} />
        </PopoverMenu>
      </div>
    </ListItem>
  );
};

interface GroupsDispatchProps {
  setGroups: (groups: Group[]) => void;
  deleteGroup: (id: string) => void;
  createNewGroup: (name: string, finallyCb: () => void) => void;
  editGroup: (...args: Parameters<typeof editGroup>) => void;
}

interface GroupsProps extends GroupsDispatchProps {
  groups: Group[];
}

const Groups: React.FC<GroupsProps> = ({ groups, setGroups, deleteGroup, createNewGroup, editGroup }) => {
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
        My Lists
      </Typography>

      <Typography>Lists allow you to organize papers and share comments with groups of peers</Typography>
      <div
        css={css`
          width: 100%;
          max-width: 450px;
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
            placeholder="Your new list"
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
            <GroupRender key={group.id} {...{ group, setGroups, deleteGroup, editGroup: editGroup }} />
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

const mapDispatchToProps = (dispatch: RTDispatch): GroupsDispatchProps => {
  return {
    setGroups: groups => {
      dispatch(actions.setGroups(groups));
    },
    deleteGroup: id => {
      dispatch(deleteGroup(id));
    },
    createNewGroup: (name, finallyCb) => {
      dispatch(createNewGroup({ name, finallyCb }));
    },
    editGroup: (id, payload) => {
      dispatch(editGroup(id, payload));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(Groups);
