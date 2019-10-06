/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Chip, CircularProgress, FormControl, Grid, Input, MenuItem, Select } from '@material-ui/core';
import axios from 'axios';
import * as queryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { actions } from '../actions/papersList';
import { RootState } from '../models';
import * as presets from '../utils/presets';
import { CategoriesModal } from './Cateogries';
import InfiniteScroll from './InfiniteScroll';
import PapersListItem, { Paper } from './PapersListItem';

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

const SET_PAPERS = 'SET_PAPERS';
const ADD_PAPERS = 'ADD_PAPERS';
const MAX_RETRIES = 3;

interface PapersState {
  papers: Paper[];
}

const reducer = (state: PapersState, action: { type: 'SET_PAPERS' | 'ADD_PAPERS'; payload: Paper[] }) => {
  switch (action.type) {
    case SET_PAPERS:
      return { ...state, papers: action.payload };
    case ADD_PAPERS:
      return { ...state, papers: [...state.papers, ...action.payload] };
    default:
      throw new Error('Action does not exist');
  }
};
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

interface RequestParams {
  age: string;
  q: string;
  sort: string;
  author: string;
  page_num: number;
}

interface PapersListProps {
  match: RouteComponentProps<QueryParam>['match'];
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
  toggleCategoryModal: () => void;
  setSelectedCategories: (categories: string[]) => void;
}

const PapersList: React.FC<PapersListProps> = ({
  match,
  location,
  history,
  toggleCategoryModal,
  setSelectedCategories,
}) => {
  const [papersState, dispatch] = React.useReducer(reducer, { papers: [] });
  const isFirstLoad = React.useRef(true);
  const [scrollId, setScrollId] = React.useState(Math.random());
  const [hasMorePapers, setHasMorePapers] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalPapers, setTotalPapers] = React.useState(0);
  const numRetries = React.useRef(0);

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
    };

    if (match && match.path === '/library') {
      url = '/library';
    }
    setIsLoading(true);
    axios
      .get(url, { params: requestParams })
      .then(result => {
        const newPapers = result.data.papers;
        // Everytime we load page 0 we assume it's a new query
        if (page === 1) {
          dispatch({ type: SET_PAPERS, payload: newPapers });
          setTotalPapers(result.data.count);
        } else {
          dispatch({ type: ADD_PAPERS, payload: newPapers });
        }
        setHasMorePapers(newPapers.length !== 0);
        numRetries.current = 0;
      })
      .catch(e => {
        if (numRetries.current >= MAX_RETRIES) {
          setHasMorePapers(false);
          console.warn('Failed to load content', e);
        }
        numRetries.current++;
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      dispatch({ type: SET_PAPERS, payload: [] });
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
  const { papers } = papersState;
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
    allCategories: state.papersList.allCategories,
    selectedCategories: state.papersList.selectedCategories,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleCategoryModal: () => {
    dispatch(actions.toggleCategoriesModal());
  },
  setSelectedCategories: (categories: string[]) => {
    dispatch(actions.setSelectedCategories(categories));
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(withRouter(PapersList));
