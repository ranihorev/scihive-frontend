/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Card, FormControl, Grid, Input, MenuItem, Select, Typography } from '@material-ui/core';
import { isEmpty, pick, range } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router';
import shallow from 'zustand/shallow';
import { LocationContext } from '../../LocationContext';
import { Group, isValidSort, SortBy } from '../../models';
import { RequestParams, usePapersListStore } from '../../stores/papersList';
import { useUserStore } from '../../stores/user';
import * as presets from '../../utils/presets';
import InfiniteScroll from '../InfiniteScroll';
import PapersListItem from '../PapersListItem';
import { FileUploader } from '../uploader';
import { Title } from './Title';
import { isMobile } from 'react-device-detect';

const formControlCss = css({
  margin: '8px 8px 8px 0px',
  minWidth: 80,
});

const filtersCss = css`
  ${presets.row};
  align-items: center;
`;

const filterValueCss = css`
  font-size: 13px;
`;

const filterMenuItemCss = css`
  font-size: 13px;
  padding: 8px 12px;
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

const ALL_COLLECTIONS = 'All collections';

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
      {range(0, count).map(() => (
        <Card
          css={css`
            margin: 10px 0;
            width: 100%;
            position: relative;
            margin-bottom: 20px;
          `}
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
  const [scrollId, setScrollId] = React.useState(Math.random());
  const [hasMorePapers, setHasMorePapers] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const isLibraryMode = match.path === '/library';
  const isLibraryOrList = isLibraryMode || Boolean(groupId);

  let groupName = getGroupName(inviteGroup ? [...groups, inviteGroup] : groups, groupId);
  const queryParams = queryString.parse(location.search) as Partial<RequestParams>;
  const age = getAgeQuery(queryParams, isLibraryOrList);
  const sort = getSortQuery(queryParams, isLibraryOrList);

  const loadPapers = (page: number) => {
    let url = '/papers/all';

    const requestParams: Partial<RequestParams> = {
      author: authorId,
      page_num: page,
      age: getAgeQuery(queryParams, isLibraryOrList),
      sort: getSortQuery(queryParams, isLibraryOrList),
      q: (queryParams.q as string) || undefined,
      group: groupId || queryParams.group,
      library: isLibraryMode,
    };

    setIsLoading(true);
    fetchPapers({ url, requestParams, setHasMorePapers, finallyCb: () => setIsLoading(false) });
  };

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
  const handleFiltersEvent = (event: React.ChangeEvent<{ name?: string; value: unknown }>, ignoreValue?: string) => {
    if (!event.target.name) return;
    let value: string | undefined = event.target.value as string;
    if (ignoreValue !== undefined && ignoreValue === value) {
      value = undefined;
    }
    if (value !== undefined) value = value.toLowerCase();
    handleFilters(event.target.name, value);
  };

  React.useEffect(() => {
    if (previousLocation.location === location.key) return;
    clearPapers();
    setHasMorePapers(true);
    setIsLoading(false);
    setScrollId(Math.random());
    previousLocation.location = location.key;
  }, [clearPapers, location, previousLocation]);

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
          <FormControl css={formControlCss}>
            <Select
              value={age}
              onChange={e => handleFiltersEvent(e)}
              input={<Input name="age" id="filter-helper" />}
              css={filterValueCss}
            >
              <MenuItem css={filterMenuItemCss} value="day">
                Today
              </MenuItem>
              <MenuItem css={filterMenuItemCss} value="week">
                This week
              </MenuItem>
              <MenuItem css={filterMenuItemCss} value="month">
                This month
              </MenuItem>
              <MenuItem css={filterMenuItemCss} value="all">
                All times
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl css={formControlCss}>
            <Select
              value={sort}
              onChange={e => handleFiltersEvent(e)}
              input={<Input name="sort" id="sort-helper" />}
              css={filterValueCss}
            >
              <MenuItem css={filterMenuItemCss} value="date">
                Date
              </MenuItem>
              {/* <MenuItem value="comments">Comments</MenuItem> */}
              <MenuItem css={filterMenuItemCss} value="tweets">
                Tweets
              </MenuItem>
              <MenuItem css={filterMenuItemCss} value="bookmarks">
                Stars
              </MenuItem>
              {queryParams.q && (
                <MenuItem css={filterMenuItemCss} value="score">
                  Relevance
                </MenuItem>
              )}
              {isLibraryOrList && (
                <MenuItem css={filterMenuItemCss} value="date_added">
                  Date added
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {isLibraryOrList && !isEmpty(groups) && (
            <FormControl css={formControlCss}>
              <Select
                value={groupId || ALL_COLLECTIONS}
                onChange={e => {
                  history.push({
                    pathname: e.target.value === ALL_COLLECTIONS ? '/library' : `/collection/${e.target.value}`,
                    search: location.search,
                  });
                }}
                input={<Input name="group" id="group-helper" />}
                css={filterValueCss}
              >
                <MenuItem css={filterMenuItemCss} value={ALL_COLLECTIONS}>
                  All collections
                </MenuItem>
                {groups.map(group => (
                  <MenuItem css={filterMenuItemCss} value={group.id} key={group.id}>
                    <div
                      css={css`
                        max-width: 200px;
                        overflow-x: hidden;
                        text-overflow: ellipsis;
                      `}
                    >
                      {group.name}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
      </div>
      <Grid container direction="column" key={scrollId}>
        <InfiniteScroll
          pageStart={0}
          loadMore={(page: number) => {
            loadPapers(page);
          }}
          hasMore={hasMorePapers && !isLoading}
          isLoading={isLoading}
          loader={papers.length === 0 ? <PostLoader count={5} /> : <PostLoader count={2} />}
        >
          {isEmpty(papers) && !isLoading && !hasMorePapers && (
            <Typography variant="h5" css={{ textAlign: 'center', fontWeight: 'bold', marginTop: 60 }}>
              No papers found :(
            </Typography>
          )}
          {papers.map(p => (
            <PapersListItem key={p.id} paper={p} groups={groups} showAbstract={!isLibraryOrList} showMetadata={true} />
          ))}
        </InfiniteScroll>
      </Grid>
      <FileUploader />
    </div>
  );
};

export default PapersList;
