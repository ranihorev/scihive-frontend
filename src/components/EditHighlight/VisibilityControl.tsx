/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Select } from '@material-ui/core';
import React from 'react';
import shallow from 'zustand/shallow';
import { VISIBILITIES, Visibility, VisibilityType } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { useUserStore } from '../../stores/user';
import { presets } from '../../utils';

interface Props {
  setCommentVisibilty: (visibility: Visibility) => void;
  visibilitySettings: Visibility;
}

export const VisibilityControl: React.FC<Props> = ({ visibilitySettings, setCommentVisibilty }) => {
  const paperGroupIds = usePaperStore(state => state.groupIds);
  const { username, groups } = useUserStore(
    state => ({ username: state.userData?.username, groups: state.groups.filter(g => paperGroupIds.includes(g.id)) }),
    shallow,
  );

  const onVisibiltyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    if ((VISIBILITIES as Readonly<string[]>).includes(value)) {
      setCommentVisibilty({ type: value as VisibilityType });
    } else {
      setCommentVisibilty({ type: 'group', id: value });
    }
  };
  const fontSize = 13;
  const textMinWidth = 70;
  return (
    <div css={[presets.col, { fontSize }]}>
      <div css={[presets.row, { alignItems: 'center' }]}>
        <div css={{ minWidth: textMinWidth }}>Share with:</div>
        <Select
          value={
            visibilitySettings.type === 'group'
              ? visibilitySettings.id
              : visibilitySettings.type === 'anonymous'
              ? 'public'
              : visibilitySettings.type
          }
          css={{ marginLeft: 5, minWidth: 120, '& .MuiSelect-select': { fontSize } }}
          onChange={onVisibiltyChange}
          native={true}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      <div css={[presets.row, { alignItems: 'center', marginTop: 5 }]}>
        <div css={{ minWidth: textMinWidth }}>Share as:</div>
        <Select
          value={visibilitySettings.type}
          css={{ marginLeft: 5, minWidth: 120, '& .MuiSelect-select': { fontSize } }}
          onChange={onVisibiltyChange}
          native={true}
        >
          <option value="public">{username}</option>
          {['anonymous', 'public'].includes(visibilitySettings.type) && <option value="anonymous">Anonymous</option>}
        </Select>
      </div>
    </div>
  );
};
