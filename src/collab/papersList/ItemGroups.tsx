/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Group } from '../../models';
import { presets } from '../../utils';
import { Tooltip } from '@material-ui/core';
import styles from './styles.module.scss';

const SingleGroupMarker: React.FC<{ group?: Group; index: number }> = ({ group, index }) => {
  if (!group) return null;

  return (
    <Tooltip title={group.name} placement="top" arrow>
      <Link
        to={`/collection/${group.id}/`}
        className={styles.groupMarker}
        style={{
          backgroundColor: presets.getGroupColor(group.color),
        }}
      />
    </Tooltip>
  );
};

export const GroupMarkers: React.FC<{ paperGroupIds: string[]; groups: Group[] }> = ({ paperGroupIds, groups }) => {
  return (
    <div className={styles.groupMarkers}>
      {paperGroupIds.map((groupId, index) => (
        <SingleGroupMarker group={groups.find(g => g.id === groupId)} index={index} key={groupId} />
      ))}
    </div>
  );
};
