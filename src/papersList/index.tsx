/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, Fab, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import * as queryString from 'query-string';
import React, { Suspense } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import baseStyles from '../base.module.scss';
import { Group, isValidSort, PaperListResponse, PapersListRequestParams } from '../models';
import { useUserStore } from '../stores/user';
import { TopBar, TopBarButton, TopBarLoginButton } from '../topBar';
import { HelpTooltip } from '../utils/HelpTooltip';
import { useUploadViaUrl } from '../utils/hooks';
import { QueryContext } from '../utils/QueryContext';
import { Spacer } from '../utils/Spacer';
import { useFetchGroups } from '../utils/useGroups';
import { useLatestCallback } from '../utils/useLatestCallback';
import { Filters, SearchField } from './filters';
import { ItemPlaceholder } from './ItemPlaceholder';
import styles from './styles.module.scss';

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

const getAgeQuery = (queryParams: Partial<PapersListRequestParams>, isLibraryOrList: boolean) => {
  const isDefaultAgeToAll = isLibraryOrList || queryParams.q;
  return queryParams.age || (isDefaultAgeToAll ? 'all' : 'week');
};

const getSortQuery = (
  queryParams: Partial<PapersListRequestParams>,
  isLibraryOrList: boolean,
): PapersListRequestParams['sort'] => {
  return (
    (isValidSort(queryParams.sort) && queryParams.sort) ||
    (queryParams.q ? 'score' : isLibraryOrList ? 'date_added' : 'tweets')
  );
};

const Items = React.lazy(() => import('./Items'));

const PapersListContent: React.FC<{ isLibraryMode: boolean }> = ({ isLibraryMode }) => {
  const queryContext = React.useContext(QueryContext);
  const groups = useFetchGroups();
  const location = useLocation();
  const history = useHistory();

  const queryParams = queryString.parse(location.search) as Partial<PapersListRequestParams>;
  const group = isLibraryMode ? queryParams.group : undefined;
  const author = queryParams.author;
  const age = getAgeQuery(queryParams, isLibraryMode);
  const sort = getSortQuery(queryParams, isLibraryMode);
  const searchQuery = queryParams.q;

  const requestParams: Partial<PapersListRequestParams> = {
    author,
    age,
    sort,
    q: searchQuery,
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

  const updateQueryParams = (key: keyof PapersListRequestParams, value: string | undefined) => {
    const newQ = {
      ...queryString.parse(location.search),
      [key]: value,
    };
    if (!value) delete newQ[key];
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ),
    });
  };

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

  return (
    <div className={baseStyles.basePage}>
      <Spacer size={16} />
      <div className={styles.paperListTitleWrapper}>
        <Typography variant="h4" className={styles.paperListTitle}>
          {group ? getGroupName(groups, group) : author ? author : isLibraryMode ? 'My Library' : 'Discover'}
        </Typography>
        <Spacer size={8} grow />
        <Button component={RouterLink} to="/collections" color="primary">
          Collections
        </Button>
      </div>
      <Spacer size={4} />
      {totalPapers !== undefined && (
        <React.Fragment>
          <div className={styles.filtersRow}>
            <Typography variant="subtitle2">{totalPapers} papers</Typography>
            <div className={baseStyles.centeredRow}>
              <SearchField {...{ requestParams, updateQueryParams }} />
              <Filters {...{ requestParams, updateQueryParams }} />
            </div>
          </div>
          <Spacer size={16} />
        </React.Fragment>
      )}
      {totalPapers === 0 && <Typography variant="h5">No papers found :(</Typography>}
      <div>
        <Suspense fallback={<ItemPlaceholder count={5} />}>
          <Items {...{ data, isFetchingMore, groups }} />
        </Suspense>
      </div>
    </div>
  );
};

export const PapersList: React.FC<{ isLibraryMode?: boolean }> = ({ isLibraryMode = false }) => {
  useUploadViaUrl();
  const isLoggedIn = useUserStore(state => state.status === 'loggedIn');
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          isLoggedIn ? (
            isLibraryMode ? (
              <TopBarButton to="/discover">Discover</TopBarButton>
            ) : (
              <TopBarButton to="/library">Library</TopBarButton>
            )
          ) : (
            <TopBarLoginButton />
          )
        }
      />
      <PapersListContent {...{ isLibraryMode }} />
      {isLibraryMode && (
        <div className={styles.uploadPaperButton}>
          <HelpTooltip title="Upload Paper" arrow={false} placement="left">
            <RouterLink to="/upload">
              <Fab color="primary" aria-label="add" size="small">
                <AddIcon />
              </Fab>
            </RouterLink>
          </HelpTooltip>
        </div>
      )}
    </div>
  );
};
