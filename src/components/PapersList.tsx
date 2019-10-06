/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Chip, CircularProgress, FormControl, Grid, Input, MenuItem, Select } from '@material-ui/core';
import * as queryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { actions } from '../actions/papersList';
import { PaperListItem, RootState } from '../models';
import { fetchPapers, RequestParams } from '../thunks';
import * as presets from '../utils/presets';
import { CategoriesModal } from './Cateogries';
import InfiniteScroll from './InfiniteScroll';
import PapersListItem from './PapersListItem';

const formControlCss = css({
  margin: '8px 8px 8px 0px',
  minWidth: 80,
});

const spinnerEmptyStateCss = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
});

const spinnerCss = css({
  textAlign: 'center',
});
const scrollWrapperCss = css({
  width: '100%',
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

interface QueryParam {
  age: string;
  q: string;
  sort: string;
  authorId: string;
}

interface QueryParams {
  age?: string;
  q?: string;
  sort?: string;
}

interface PapersListDispatchProps {
  toggleCategoryModal: () => void;
  setSelectedCategories: (categories: string[]) => void;
  fetchPapers: (...args: Parameters<typeof fetchPapers>) => void;
  clearPapers: () => void;
}
interface PapersListProps extends PapersListDispatchProps {
  match: RouteComponentProps<QueryParam>['match'];
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
  papers: PaperListItem[];
  totalPapers: number;
}

const PapersList: React.FC<PapersListProps> = ({
  match,
  location,
  history,
  toggleCategoryModal,
  setSelectedCategories,
  fetchPapers,
  clearPapers,
  papers,
  totalPapers,
}) => {
  const isFirstLoad = React.useRef(true);
  const [scrollId, setScrollId] = React.useState(Math.random());
  const [hasMorePapers, setHasMorePapers] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const getAgeQuery = (queryParams: QueryParams) => {
    return queryParams.age || (match.path === '/library' || queryParams.q ? 'all' : 'week');
  };

  const getSortQuery = (queryParams: QueryParams) => {
    return queryParams.sort || (queryParams.q ? 'score' : 'tweets');
  };

  const loadPapers = (page: number) => {
    let url = '/papers/all';

    const queryParams = queryString.parse(location.search);
    const requestParams: Partial<RequestParams> = {
      author: match.params.authorId,
      page_num: page,
      age: getAgeQuery(queryParams),
      sort: getSortQuery(queryParams),
      q: (queryParams.q as string) || undefined,
    };

    if (match && match.path === '/library') {
      url = '/library';
    }

    setIsLoading(true);
    fetchPapers({ url, requestParams, setHasMorePapers, finallyCb: () => setIsLoading(false) });
  };

  const handleFilters = (queryParam: string, queryValue: string) => {
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
  const handleFiltersEvent = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    if (!event.target.name) return;
    const value = event.target.value as string;
    handleFilters(event.target.name, value.toLowerCase());
  };

  React.useEffect(() => {
    clearPapers();
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      setHasMorePapers(true);
      setIsLoading(false);
      setScrollId(Math.random());
    }
  }, [match.path, location.search]);

  React.useLayoutEffect(() => {
    const q = queryString.parse(location.search);
    const categories = q.categories as string;
    if (categories) setSelectedCategories(categories.split(';'));
  }, [location.search, setSelectedCategories]);

  const q = queryString.parse(location.search);
  const age = getAgeQuery(q);
  const sort = getSortQuery(q);

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
              onChange={handleFiltersEvent}
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
                All
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl css={formControlCss}>
            <Select
              value={sort}
              onChange={handleFiltersEvent}
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
              {q && q.q && (
                <MenuItem css={filterMenuItemCss} value="score">
                  Relevance
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Chip
            size="small"
            variant="outlined"
            label="Categories"
            clickable={false}
            onClick={() => toggleCategoryModal()}
            css={css`
              font-size: 13px;
              height: 26px;
              &:hover {
                background-color: rgba(0, 0, 0, 0.08);
                cursor: pointer;
              }
            `}
          />
          <CategoriesModal onSelect={handleFilters} />
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
          loader={
            <div key={0} css={papers.length === 0 ? spinnerEmptyStateCss : spinnerCss}>
              <CircularProgress />
            </div>
          }
          className={scrollWrapperCss}
        >
          {papers.map(p => (
            <PapersListItem key={p._id} paper={p} />
          ))}
        </InfiniteScroll>
      </Grid>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    papers: state.papersList.papers,
    allCategories: state.papersList.allCategories,
    selectedCategories: state.papersList.selectedCategories,
    totalPapers: state.papersList.totalPapers,
  };
};

const mapDispatchToProps = (dispatch: RTDispatch): PapersListDispatchProps => ({
  toggleCategoryModal: () => {
    dispatch(actions.toggleCategoriesModal());
  },
  setSelectedCategories: categories => {
    dispatch(actions.setSelectedCategories(categories));
  },
  fetchPapers: payload => {
    dispatch(fetchPapers(payload));
  },
  clearPapers: () => {
    dispatch(actions.clearPapers());
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(withRouter(PapersList));
