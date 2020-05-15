/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, IconButton, List, ListItem, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { Group } from '../../models';
import { useUserStore } from '../../stores/user';
import { presets } from '../../utils';
import { getGroupColor } from '../../utils/presets';
import { EditGroup } from './EditGroup';
import GroupShare from './GroupShare';
import { PopoverMenu } from '../PopoverMenu';

const ICON_SIZE = 16;
const iconCss = css({ fontSize: ICON_SIZE });

interface GroupProps {
  group: Group;
}

const GroupRender: React.FC<GroupProps> = ({ group }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const editRef = React.useRef<HTMLDivElement>(null);
  const deleteGroup = useUserStore(state => state.deleteGroup);

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
            width: 12px;
            height: 12px;
            border-radius: 3px;
            margin-right: 8px;
          `}
          style={{ backgroundColor: getGroupColor(group.color) }}
        />
        <div
          css={css`
            flex-grow: 1;
            line-height: 1;
          `}
        >
          <Link to={`/collection/${group.id}/`} css={[presets.simpleLinkWithHover]}>
            {group.name}
          </Link>
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
          <GroupShare iconSize={ICON_SIZE} groupId={group.id} />
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
          <EditGroup group={group} onFinishEdit={() => setIsEditOpen(false)} />
        </PopoverMenu>
      </div>
    </ListItem>
  );
};

const Groups: React.FC = () => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = React.useState(false);
  const { createNewGroup, groups } = useUserStore(
    state => ({ createNewGroup: state.newGroup, groups: state.groups }),
    shallow,
  );

  const handleSubmitNewGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitDisabled(true);
    if (!isSubmitDisabled) {
      try {
        await createNewGroup({ name: newGroupName });
        setNewGroupName('');
      } catch (e) {
      } finally {
        setIsSubmitDisabled(false);
      }
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
        My Collections
      </Typography>

      <Typography>Collections allow you to organize papers and share comments with groups of peers</Typography>
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
            <GroupRender key={group.id} group={group} />
          ))}
        </List>
      </div>
    </div>
  );
};

export default Groups;
