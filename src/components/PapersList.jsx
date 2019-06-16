/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Input, Select, MenuItem, FormControl, CircularProgress, Grid, Chip } from '@material-ui/core';
import * as queryString from 'query-string';
import InfiniteScroll from './InfiniteScroll';
import PapersListItem from './PapersListItem';
import * as presets from '../utils/presets';
import { CategoriesModal } from './Cateogries';
import { actions } from '../actions/categories';

const formControlCss = css({
  margin: '8px 0 8px 8px',
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

const reducer = (state, action) => {
  switch (action.type) {
    case SET_PAPERS:
      return { ...state, papers: action.payload };
    case ADD_PAPERS:
      return { ...state, papers: [...state.papers, ...action.payload] };
    default:
      throw new Error('Action does not exist');
  }
};

const PapersList = ({ match, location, history, toggleCategoryModal, setSelectedCategories }) => {
  const [papersState, dispatch] = React.useReducer(reducer, { papers: [] });
  const isFirstLoad = React.useRef(true);
  const [scrollId, setScrollId] = React.useState(Math.random());
  const [hasMorePapers, setHasMorePapers] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalPapers, setTotalPapers] = React.useState(0);

  const getAgeQuery = queryParams => {
    return queryParams.age || (match.path === '/library' || queryParams.q ? 'all' : 'week');
  };

  const getSortQuery = queryParams => {
    return queryParams.sort || (queryParams.q ? 'score' : 'tweets');
  };

  const loadPapers = page => {
    let url = '/papers/all';

    const q = queryString.parse(location.search);
    q.author = match.params.authorId;
    q.page_num = page;
    q.age = getAgeQuery(q);
    q.sort = getSortQuery(q);

    if (match && match.path === '/library') {
      url = '/library';
    }
    setIsLoading(true);
    axios
      .get(url, { params: q })
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
      })
      .catch(e => console.warn(e))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFilters = (queryParam, queryValue) => {
    const newQ = {
      ...queryString.parse(location.search),
      [queryParam]: queryValue,
    };
    if (!queryValue) delete newQ.queryParam;
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ),
    });
  };
  const handleFiltersEvent = event => {
    handleFilters(event.target.name, event.target.value.toLowerCase());
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
    if (q.categories) setSelectedCategories(q.categories.split(';'));
  }, []);

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
          <Chip
            variant="outlined"
            size="small"
            label="Categories"
            clickable={false}
            onClick={() => toggleCategoryModal()}
            css={css`
              font-size: 13px;
              &:hover {
                background-color: rgba(0, 0, 0, 0.08);
                cursor: pointer;
              }
            `}
          />
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
          <CategoriesModal onSelect={handleFilters} />
        </div>
      </div>
      <Grid container direction="column" key={scrollId}>
        <InfiniteScroll
          pageStart={0}
          loadMore={page => {
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

const mapStateToProps = state => {
  return {
    allCategories: state.papersList.allCategories,
    selectedCategories: state.papersList.selectedCategories,
  };
};

const mapDispatchToProps = dispatch => ({
  toggleCategoryModal: () => dispatch(actions.toggleCategoriesModal()),
  setSelectedCategories: categories => dispatch(actions.setSelectedCategories(categories)),
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(withRouter(PapersList));
