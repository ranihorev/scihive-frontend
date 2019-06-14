/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { Input, Select, MenuItem, FormControl, CircularProgress, Grid } from '@material-ui/core';
import * as queryString from 'query-string';
import InfiniteScroll from 'react-infinite-scroller';
import PapersListItem from './PapersListItem';
import * as presets from '../utils/presets';

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

const filtersCss = css({
  marginLeft: 'auto',
});

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

const PapersList = ({ match, location, history }) => {
  const [papersState, dispatch] = React.useReducer(reducer, { papers: [] });
  const isFirstLoad = React.useRef(true);
  const [scrollId, setScrollId] = React.useState(Math.random());
  const [hasMorePapers, setHasMorePapers] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
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

  const handleFilters = event => {
    const newQ = {
      ...queryString.parse(location.search),
      [event.target.name]: event.target.value.toLowerCase(),
    };
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ),
    });
  };
  React.useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      dispatch({ type: SET_PAPERS, payload: [] });
      setHasMorePapers(true);
      setIsLoading(true);
      setScrollId(Math.random());
    }
  }, [match.path, location.search]);

  const q = queryString.parse(location.search);
  const age = getAgeQuery(q);
  const sort = getSortQuery(q);
  const { papers } = papersState;
  return (
    <React.Fragment>
      <Grid
        container
        css={css({
          maxWidth: 992,
          paddingTop: 10,
          margin: '10px 0px',
          [presets.mqMax('lg')]: {
            margin: '0px 15px',
          },
        })}
      >
        <Grid container direction="row" alignItems="center" justify="space-between">
          <Grid item>{!isLoading ? `${totalPapers} papers` : null}</Grid>
          <Grid item css={filtersCss}>
            <FormControl css={formControlCss}>
              <Select
                value={age}
                onChange={handleFilters}
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
                onChange={handleFilters}
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
          </Grid>
        </Grid>
        <Grid container direction="column" key={scrollId}>
          <InfiniteScroll
            pageStart={0}
            loadMore={page => {
              console.log(`loading ${page}`);
              loadPapers(page);
            }}
            hasMore={hasMorePapers && (papers.length === 0 || !isLoading)}
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
      </Grid>
    </React.Fragment>
  );
};

export default withRouter(PapersList);
