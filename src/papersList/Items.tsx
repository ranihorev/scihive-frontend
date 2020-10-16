import React from 'react';
import { IsFetchingMoreValue } from 'react-query';
import { Group, PaperListResponse } from '../models';
import { Spacer } from '../utils/Spacer';
import { Item } from './Item';
import { ItemPlaceholder } from './ItemPlaceholder';

const Items: React.FC<{ data?: PaperListResponse[]; isFetchingMore?: IsFetchingMoreValue; groups: Group[] }> = ({
  data,
  isFetchingMore,
  groups,
}) => {
  return (
    <div>
      {data?.map(group => group.papers.map(paper => <Item key={paper.id} paper={paper} groups={groups} />))}
      {!data && <Spacer size={16} />}
      {(!data || isFetchingMore) && <ItemPlaceholder count={data ? 2 : 5} />}
    </div>
  );
};

export default Items;
