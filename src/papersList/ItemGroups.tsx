/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Tooltip } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Group } from '../models';
import { presets } from '../utils';
import styles from './styles.module.scss';
import cx from 'classnames';

const SingleGroupMarker: React.FC<{ group?: Group; index: number }> = ({ group, index }) => {
  if (!group) return null;

  return (
    <Tooltip title={group.name} placement="top" arrow>
      <Link
        to={`/library/?group=${group.id}`}
        className={cx(styles.groupMarker, 'ml-2 rounded-b')}
        style={{
          backgroundColor: presets.getGroupColor(group.color),
        }}
      />
    </Tooltip>
  );
};

export const GroupMarkers: React.FC<{ paperGroupIds: string[]; groups: Group[] }> = ({ paperGroupIds, groups }) => {
  return (
    <div className="flex flex-row-reverse absolute top-0 right-0">
      {paperGroupIds.map((groupId, index) => (
        <SingleGroupMarker group={groups.find(g => g.id === groupId)} index={index} key={groupId} />
      ))}
    </div>
  );
};
