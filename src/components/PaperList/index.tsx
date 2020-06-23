/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Card, Grid, Typography } from '@material-ui/core';
import { isEmpty, pick, range } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { isMobile } from 'react-device-detect';
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router';
import shallow from 'zustand/shallow';
import { LocationContext } from '../../LocationContext';
import { Group, isValidSort, SortBy } from '../../models';
import { RequestParams, usePapersListStore } from '../../stores/papersList';
import { useUserStore } from '../../stores/user';
import * as presets from '../../utils/presets';
import PapersListItem from '../PapersListItem';
import { FileUploader } from '../uploader';
import { FilterEvent, GroupFilter, SortControl, TimeFilter } from './Filters';
import { Title } from './Title';
import { useInfiniteScroll } from '../../utils/useInfiniteScroll';
import { useLatestCallback } from '../../utils/useLatestCallback';

const filtersCss = css`
  ${presets.row};
  align-items: center;
`;

interface QueryParams {
  age?: string;
  q?: SortBy;
  sort?: string;
}

export interface PaperListRouterParams {
  authorId?: string;
  groupId?: string;
}

const getGroupName = (groups: Group[], groupId: string | undefined) => {
  if (!groupId) return undefined;
  const group = groups.find(g => g.id === groupId);
  if (group) return group.name;
  return undefined;
};

const getAgeQuery = (queryParams: Partial<RequestParams>, isLibraryOrList: boolean) => {
  const isDefaultAgeToAll = isLibraryOrList || queryParams.q;
  return queryParams.age || (isDefaultAgeToAll ? 'all' : 'week');
};

const getSortQuery = (queryParams: Partial<RequestParams>, isLibraryOrList: boolean): RequestParams['sort'] => {
  return (
    (isValidSort(queryParams.sort) && queryParams.sort) ||
    (queryParams.q ? 'score' : isLibraryOrList ? 'date_added' : 'date')
  );
};

const PostLoader: React.FC<{ count: number }> = React.memo(({ count }) => {
  return (
    <React.Fragment>
      {range(0, count).map(index => (
        <Card
          css={css`
            margin: 10px 0;
            width: 100%;
            position: relative;
            margin-bottom: 20px;
          `}
          key={index}
        >
          <div css={{ padding: isMobile ? `16px` : `28px 20px` }}>
            <ContentLoader width="100%" viewBox={`0 0 ${isMobile ? '400' : '800'} 140`}>
              <rect x="0" y="0" rx="4" ry="4" width="100%" height="10" />
              <rect x="0" y="18" rx="4" ry="4" width="35%" height="10" />
              <rect x="0" y="46" rx="4" ry="4" width="10%" height="8" />
              <rect x="11%" y="46" rx="4" ry="4" width="10%" height="8" />
              <rect x="0" y="70" rx="4" ry="4" width="100%" height="1" />
              <rect x="0" y="90" rx="4" ry="4" width="100%" height="8" />
              <rect x="0" y="110" rx="4" ry="4" width="100%" height="8" />
              <rect x="0" y="130" rx="4" ry="4" width="90%" height="8" />
            </ContentLoader>
          </div>
        </Card>
      ))}
    </React.Fragment>
  );
});

const PapersList: React.FC = () => {
  const { groups, inviteGroup } = useUserStore(
    state => ({ groups: state.groups, inviteGroup: state.inviteGroup }),
    shallow,
  );
  const { clearPapers, fetchPapers, totalPapers, papers } = usePapersListStore(
    state => pick(state, ['fetchPapers', 'clearPapers', 'totalPapers', 'papers']),
    shallow,
  );
  const previousLocation = React.useContext(LocationContext);
  const match = useRouteMatch();
  const { groupId, authorId } = useParams<PaperListRouterParams>();
  const location = useLocation();
  const history = useHistory();
  const isLibraryMode = match.path === '/library';
  const isLibraryOrList = isLibraryMode || Boolean(groupId);
  const initialLoadRef = React.useRef(true);

  let groupName = getGroupName(inviteGroup ? [...groups, inviteGroup] : groups, groupId);
  const queryParams = queryString.parse(location.search) as Partial<RequestParams>;
  const age = getAgeQuery(queryParams, isLibraryOrList);
  const sort = getSortQuery(queryParams, isLibraryOrList);

  const loadPapers = useLatestCallback(async (page: number) => {
    initialLoadRef.current = false;
    let url = '/papers/all';

    const queryParams = queryString.parse(location.search) as Partial<RequestParams>;

    const requestParams: Partial<RequestParams> = {
      author: authorId,
      page_num: page,
      age: getAgeQuery(queryParams, isLibraryOrList),
      sort: getSortQuery(queryParams, isLibraryOrList),
      q: (queryParams.q as string) || undefined,
      group: groupId || queryParams.group,
      library: isLibraryMode,
    };

    const hasMore = await fetchPapers({ url, requestParams });
    return hasMore;
  });

  React.useEffect(() => {
    if (previousLocation.location === location.key) return;
    clearPapers();
    previousLocation.location = location.key;
  }, [clearPapers, location, previousLocation]);

  const { hasMore, isLoading } = useInfiniteScroll(
    loadPapers,
    [loadPapers, authorId, groupId, isLibraryMode, isLibraryOrList, location.search, location.key],
    { initialLoad: true, thresholdPx: 250 },
  );

  const handleFilters = (queryParam: string, queryValue: string | undefined) => {
    const newQ = {
      ...queryString.parse(location.search),
      [queryParam]: queryValue,
    };
    if (!queryValue) delete newQ[queryParam];
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ),
    });
  };
  const handleFiltersEvent: FilterEvent = event => {
    if (!event.target.name) return;
    let value: string | undefined = event.target.value as string;
    if (value !== undefined) value = value.toLowerCase();
    handleFilters(event.target.name, value);
  };

  return (
    <div
      css={css`
        ${presets.col};
        max-width: 992px;
        width: 100%;
        padding-top: 10px;
        margin: 10px 0px;
        ${presets.mqMax('lg')} {
          margin: 0px 15px;
        }
      `}
    >
      <Title {...{ isLibraryMode, authorId, groupId, groupName }} />
      <div
        css={css`
          ${presets.row};
          align-items: center;
          justify-content: space-between;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-grow: 1;
          `}
        >
          {!isLoading ? `${totalPapers} papers` : null}
        </div>
        <div css={filtersCss}>
          <TimeFilter age={age} onChange={handleFiltersEvent} />
          <SortControl
            sort={sort}
            onChange={handleFiltersEvent}
            hasSearchQuery={Boolean(queryParams.q)}
            isLibraryOrList={isLibraryOrList}
          />
          {isLibraryOrList && !isEmpty(groups) && <GroupFilter groupId={groupId} groups={groups} />}
        </div>
      </div>
      <Grid container direction="column">
        {isEmpty(papers) && !isLoading && !hasMore && (
          <Typography variant="h5" css={{ textAlign: 'center', fontWeight: 'bold', marginTop: 60 }}>
            No papers found :(
          </Typography>
        )}
        {papers.map(p => (
          <PapersListItem key={p.id} paper={p} groups={groups} showAbstract={!isLibraryOrList} showMetadata={true} />
        ))}
        {isLoading && (papers.length === 0 ? <PostLoader count={5} /> : <PostLoader count={2} />)}
      </Grid>
      <FileUploader />
    </div>
  );
};

export default PapersList;
