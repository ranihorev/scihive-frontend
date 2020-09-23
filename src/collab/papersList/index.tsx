/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Typography, Box } from '@material-ui/core';
import axios from 'axios';
import * as queryString from 'query-string';
import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { useLocation } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import baseStyles from '../../base.module.scss';
import { Group, isValidSort, PaperListResponse } from '../../models';
import { RequestParams } from '../../stores/papersList';
import * as presets from '../../utils/presets';
import { useLatestCallback } from '../../utils/useLatestCallback';
import { TopBar } from '../topBar';
import { QueryContext } from '../utils/QueryContext';
import { useFetchGroups } from '../utils/useGroups';
import { Item } from './Item';
import { ItemPlaceholder } from './ItemPlaceholder';
import styles from './styles.module.scss';
import { Spacer } from '../utils/Spacer';
import { useUserNewStore } from '../../stores/userNew';

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
const PapersListContent: React.FC<{ isLibraryMode: boolean }> = ({ isLibraryMode }) => {
  const queryContext = React.useContext(QueryContext);
  const groups = useFetchGroups();
  const location = useLocation();
  const isLibraryOrList = isLibraryMode;

  const queryParams = queryString.parse(location.search) as Partial<RequestParams>;
  const group = isLibraryMode ? queryParams.group : undefined;
  const author = queryParams.author;
  const age = getAgeQuery(queryParams, isLibraryOrList);
  const sort = getSortQuery(queryParams, isLibraryOrList);

  const requestParams: Partial<RequestParams> = {
    author,
    age,
    sort,
    q: (queryParams.q as string) || undefined,
    group,
    library: isLibraryMode,
  };
  queryContext.query = requestParams;

  const { data, isFetchingMore, isFetching, fetchMore, canFetchMore } = useInfiniteQuery(
    ['papers', requestParams],
    async (key, params, page: number = 1) => {
      const result = await axios.get<PaperListResponse>('/papers/all', {
        params: { ...requestParams, page_num: page },
      });
      return { ...result.data, page };
    },
    {
      getFetchMore: lastGroup => {
        return lastGroup.hasMore ? lastGroup.page + 1 : false;
      },
      refetchOnWindowFocus: false,
    },
  );

  const totalPapers = data ? data[0].count : undefined;

  const thresholdPx = 250;

  const onScroll = useLatestCallback(() => {
    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - thresholdPx;
    if (isFetching || !bottom) return;
    fetchMore();
  });

  React.useEffect(() => {
    if (!canFetchMore) return () => {};
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll, canFetchMore]);

  if (totalPapers === 0) {
    return (
      <div className={baseStyles.screenCentered}>
        <Typography variant="h5">No papers found :(</Typography>
      </div>
    );
  }
  return (
    <div className={baseStyles.basePage}>
      <Spacer size={16} />
      <div className={styles.paperListTitleWrapper}>
        <Typography variant="h4" className={styles.paperListTitle}>
          {group ? getGroupName(groups, group) : author ? author : isLibraryMode ? 'My Library' : 'Discover'}
        </Typography>
        <Button component={RouterLink} to="/collab/collections" color="primary">
          Collections
        </Button>
      </div>
      <Spacer size={20} />
      {totalPapers !== undefined && totalPapers > 0 && (
        <div
          css={css`
            ${presets.row};
            align-items: center;
            justify-content: space-between;
          `}
        >
          <Typography variant="subtitle2">{totalPapers} papers</Typography>
        </div>
      )}
      <div>
        {data?.map(group => group.papers.map(paper => <Item key={paper.id} paper={paper} groups={groups} />))}
        {(!data || isFetchingMore) && <ItemPlaceholder count={data ? 2 : 5} />}
      </div>
    </div>
  );
};

export const PapersList: React.FC<{ isLibraryMode?: boolean }> = ({ isLibraryMode = false }) => {
  const isLoggedIn = useUserNewStore(state => state.status === 'loggedIn');
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          isLoggedIn ? (
            <Button component={RouterLink} to="/collab/library" color="inherit">
              Library
            </Button>
          ) : (
            <Button component={RouterLink} to="/collab/start" color="inherit">
              Log in
            </Button>
          )
        }
      />
      <PapersListContent {...{ isLibraryMode }} />
    </div>
  );
};
