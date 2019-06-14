import React from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { withRouter } from 'react-router';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import * as queryString from 'query-string';
import InfiniteScroll from 'react-infinite-scroller';
import CircularProgress from '@material-ui/core/CircularProgress';
import PapersListItem from './PapersListItem';

const styles = theme => ({
  root: {
    maxWidth: 992,
    paddingTop: 10,
    margin: '10px 0px',
    [theme.breakpoints.down('lg')]: {
      margin: '0px 15px',
    },
  },
  formControl: {
    margin: '8px 0 8px 8px',
    minWidth: 100,
  },
  spinnerEmptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  spinner: {
    textAlign: 'center',
  },
  scrollWrapper: {
    width: '100%',
  },
  filters: {
    marginLeft: 'auto',
  },
});

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

const PapersList = ({ classes, match, location, history }) => {
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
      <Grid container className={classes.root}>
        <Grid container direction="row" alignItems="center" justify="space-between">
          <Grid item className={classes.summary}>
            {!isLoading ? `${totalPapers} papers` : null}
          </Grid>
          <Grid item className={classes.filters}>
            <FormControl className={classes.formControl}>
              <Select
                value={age}
                onChange={handleFilters}
                input={<Input name="age" id="filter-helper" />}
                className={classes.selector}
              >
                <MenuItem value="day">Today</MenuItem>
                <MenuItem value="week">This week</MenuItem>
                <MenuItem value="month">This month</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <Select value={sort} onChange={handleFilters} input={<Input name="sort" id="sort-helper" />}>
                <MenuItem value="date">Date</MenuItem>
                {/* <MenuItem value="comments">Comments</MenuItem> */}
                <MenuItem value="tweets">Tweets</MenuItem>
                <MenuItem value="bookmarks">Stars</MenuItem>
                {q && q.q && <MenuItem value="score">Relevance</MenuItem>}
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
              <div key={0} className={papers.length === 0 ? classes.spinnerEmptyState : classes.spinner}>
                <CircularProgress />
              </div>
            }
            className={classes.scrollWrapper}
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

export default withStyles(styles)(withRouter(PapersList));
