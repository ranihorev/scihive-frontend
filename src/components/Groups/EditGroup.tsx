/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, TextField, IconButton } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import Color from 'color';
import { pick } from 'lodash';
import React from 'react';
import { Group } from '../../models';
import { useUserStore } from '../../stores/user';
import { presets } from '../../utils';

interface EditGroupProps {
  group: Group;
  onFinishEdit: () => void;
}

export const EditGroup: React.FC<EditGroupProps> = ({ group, onFinishEdit }) => {
  const colorMargin = 10;
  const [name, setName] = React.useState(group.name);
  const [selectedColor, setSelectedColor] = React.useState<presets.GroupColor | undefined>(group.color);
  const { editGroup, deleteGroup } = useUserStore(state => pick(state, ['editGroup', 'deleteGroup']));

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
        {Object.keys(presets.GROUP_COLORS).map(colorName => {
          const currentColor = presets.GROUP_COLORS[colorName as presets.GroupColor];
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
              onClick={() => setSelectedColor(colorName as presets.GroupColor)}
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
        <IconButton
          size="small"
          css={{ alignSelf: 'center' }}
          onClick={() => {
            deleteGroup(group.id);
            onFinishEdit();
          }}
        >
          <i className="far fa-trash-alt" css={{ fontSize: 13, padding: 4 }} />
        </IconButton>
      </div>
    </div>
  );
};
