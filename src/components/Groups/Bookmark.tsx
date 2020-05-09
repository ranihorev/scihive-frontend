/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton, Input, List, ListItem } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import Color from 'color';
import { isEmpty } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { Group } from '../../models';
import { useUserStore } from '../../stores/user';
import { AddRemovePaperToGroup } from '../../stores/utils';
import { presets } from '../../utils';
import { BASE_GROUP_COLOR, COLORS, GROUP_COLORS, pickRandomColor, smallIconPadding } from '../../utils/presets';
import { PopoverMenu } from '../PopoverMenu';
import { EditGroup } from './EditGroup';

interface BookmarkProps {
  updatePaperGroup: (props: AddRemovePaperToGroup) => void;
  color?: string | undefined;
  size?: number;
  paperId: string;
  position?: 'right' | 'center' | 'left';
  selectedGroupIds: string[];
  type: 'single' | 'list';
}

interface NewGroupProps {
  value: string;
  setValue: React.Dispatch<string>;
  addPaperToGroup: (groupId: string) => void;
}

const NewGroup: React.FC<NewGroupProps> = ({ value, setValue, addPaperToGroup }) => {
  const createGroup = useUserStore(state => state.newGroup);

  const submitGroup = async () => {
    if (isEmpty(value)) return;
    const response = await createGroup({ name: value, color: pickRandomColor() });
    if (response) {
      setValue('');
      addPaperToGroup(response.new_id);
    }
  };
  return (
    <ListItem css={{ paddingTop: 12 }}>
      <Input
        value={value}
        placeholder="New list"
        autoFocus
        onChange={e => {
          setValue(e.target.value);
        }}
        onKeyPress={e => {
          if (e.key === 'Enter') submitGroup();
        }}
        inputProps={{ style: { padding: '3px 0 4px' } }}
        fullWidth
      />
      <i
        className="fas fa-plus"
        css={css`
          font-size: 14px;
          cursor: pointer;
          margin-left: 5px;
          margin-right: 2px;
          padding: 4px 0;
          color: #a5a5a5;
        `}
        onClick={() => submitGroup()}
      />
    </ListItem>
  );
};

interface GroupRenderProps {
  group: Group;
  selected: boolean;
  paperId: string;
  updatePaperGroup: (props: AddRemovePaperToGroup) => void;
  onEdit: () => void;
}

const baseGroupCss = css`
  ${presets.row};
  align-items: center;
  flex-grow: 1;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  min-height: 20px;
  padding: 5px 7px;
`;

const GroupRender: React.FC<GroupRenderProps> = ({ group, selected, paperId, updatePaperGroup, onEdit }) => {
  let backgroundHoverColor;
  const backgroundColor = GROUP_COLORS[group.color || BASE_GROUP_COLOR];
  try {
    backgroundHoverColor = Color(backgroundColor);
  } catch (e) {
    backgroundHoverColor = Color(GROUP_COLORS[BASE_GROUP_COLOR]);
  }
  backgroundHoverColor = backgroundHoverColor.darken(0.1).string();
  return (
    <ListItem key={group.id}>
      <div
        css={css`
          ${presets.row};
          width: 100%;
          align-items: center;
        `}
      >
        <div
          css={css`
            ${baseGroupCss};
            background-color: ${backgroundColor};
            &:hover {
              background-color: ${backgroundHoverColor};
            }
          `}
          onClick={() => {
            updatePaperGroup({ paperId, groupId: group.id, shouldAdd: !selected });
          }}
        >
          <div
            css={css`
              word-break: break-word;
            `}
          >
            {group.name}
          </div>
          {selected && <DoneIcon fontSize="small" />}
        </div>
        <div
          css={css`
            cursor: pointer;
            color: #a5a5a5;
            &:hover {
              color: black;
            }
          `}
          onClick={() => onEdit()}
        >
          <CreateIcon
            css={css`
              font-size: 14px;
              padding: 5px 0 5px 5px;
            `}
          />
        </div>
      </div>
    </ListItem>
  );
};

interface GroupListProps extends Pick<BookmarkProps, 'selectedGroupIds' | 'updatePaperGroup' | 'paperId'> {
  setGroupInEdit: React.Dispatch<Group | undefined>;
}

const GroupsList: React.FC<GroupListProps> = ({ selectedGroupIds, updatePaperGroup, setGroupInEdit, paperId }) => {
  const [newGroupValue, setNewGroupValue] = React.useState('');
  const groups = useUserStore(state => state.groups);
  return (
    <React.Fragment>
      <NewGroup
        value={newGroupValue}
        setValue={setNewGroupValue}
        addPaperToGroup={groupId => updatePaperGroup({ groupId, paperId, shouldAdd: true })}
      />
      <List
        dense
        css={css`
          max-height: 250px;
          overflow-y: auto;
          width: 100%;
          padding-top: 4px;
        `}
      >
        {groups
          .filter(group => new RegExp(`^${newGroupValue}`, 'i').test(group.name))
          .map(group => {
            const selected = selectedGroupIds.some(id => id === group.id);
            return (
              <GroupRender
                key={group.id}
                {...{ group, paperId, selected, updatePaperGroup }}
                onEdit={() => setGroupInEdit(group)}
              />
            );
          })}
      </List>
    </React.Fragment>
  );
};

const hint = 'Organize your papers in collections and share them with collaborators';

const Bookmark: React.FC<BookmarkProps> = ({
  updatePaperGroup,
  selectedGroupIds,
  paperId,
  color = COLORS.grey,
  size = 18,
  type,
}) => {
  const { isLoggedIn, toggleLoginModal } = useUserStore(
    state => ({ toggleLoginModal: state.toggleLoginModal, isLoggedIn: Boolean(state.userData) }),
    shallow,
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [groupInEdit, setGroupInEdit] = React.useState<Group | undefined>(undefined);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const onListsClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      toggleLoginModal('Please log in to save manage lists and bookmarks');
      return;
    }
    setIsOpen(true);
  };

  const Star = isEmpty(selectedGroupIds) ? StarBorderIcon : StarIcon;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: ${type === 'single' ? 'row-reverse' : 'column'};
      `}
    >
      <div data-rh={hint} data-rh-at="left">
        <IconButton onClick={onListsClick} buttonRef={anchorRef} size="small">
          <Star style={{ width: size, height: size, color, padding: smallIconPadding }} />
        </IconButton>
      </div>
      <div />
      <PopoverMenu
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        contentCss={css`
          width: 230px;
        `}
      >
        {groupInEdit ? (
          <EditGroup group={groupInEdit} onFinishEdit={() => setGroupInEdit(undefined)} />
        ) : (
          <GroupsList {...{ updatePaperGroup, selectedGroupIds, setGroupInEdit, paperId }} />
        )}
      </PopoverMenu>
    </div>
  );
};

export default Bookmark;
