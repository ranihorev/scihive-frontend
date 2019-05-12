import React, { Component } from 'react';
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
      margin: '0px 15px'
    }
  },
  formControl: {
    margin: '8px 0 8px 8px',
    minWidth: 100
  },
  spinnerEmptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  spinner: {
    textAlign: 'center'
  },
  scrollWrapper: {
    width: '100%'
  },
  filters: {
    marginLeft: 'auto'
  }
});

class PapersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      papers: [],
      hasMorePapers: true,
      scrollID: Math.random(),
      isLoading: true,
      papersCount: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.sort !== prevState.sort) {
      // this.loadPapers(1);
    } else if (
      prevProps.match.path !== this.props.match.path ||
      prevProps.location.search !== this.props.location.search
    ) {
      this.setState({ scrollID: Math.random() });
      this.loadPapers(1);
    }
  }

  getAgeQuery = queryParams => {
    return (
      queryParams.age ||
      (this.props.match.path === '/library' || queryParams.q ? 'all' : 'week')
    );
  };

  getSortQuery = queryParams => {
    return queryParams.sort || 'tweets';
  };

  loadPapers = page => {
    let url = '/papers/all';
    let { papers } = this.state;

    const q = queryString.parse(this.props.location.search);
    q.author = this.props.match.params.authorId;
    q.page_num = page;
    q.age = this.getAgeQuery(q);
    q.sort = this.getSortQuery(q);

    const { match } = this.props;
    if (match && match.path === '/library') {
      url = '/library';
    }

    axios
      .get(url, { params: q })
      .then(result => {
        const newPapers = result.data.papers;
        const hasMorePapers = newPapers.length !== 0;
        // Everytime we load page 0 we assume it's a new query
        if (page === 1) {
          papers = newPapers;
        } else {
          newPapers.forEach(newPaper => papers.push(newPaper));
        }
        this.setState({
          papers,
          hasMorePapers,
          isLoading: false,
          ...(page === 1 && { papersCount: result.data.count })
        });
      })
      .catch(e => console.warn(e));
  };

  handleFilters = event => {
    const { location, history } = this.props;
    const newQ = {
      ...queryString.parse(location.search),
      [event.target.name]: event.target.value.toLowerCase()
    };
    history.push({
      pathname: location.pathname,
      search: queryString.stringify(newQ)
    });
  };

  render() {
    const { classes, location } = this.props;
    const { papers, scrollID, isLoading, papersCount } = this.state;
    const q = queryString.parse(location.search);
    const age = this.getAgeQuery(q);
    const sort = this.getSortQuery(q);

    return (
      <React.Fragment>
        <Grid container className={classes.root}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justify="space-between"
          >
            <Grid item className={classes.summary}>
              {!isLoading ? `${papersCount} papers` : null}
            </Grid>
            <Grid item className={classes.filters}>
              <FormControl className={classes.formControl}>
                {/* <InputLabel htmlFor="sort-helper">Comments</InputLabel> */}
                <Select
                  value={age}
                  onChange={this.handleFilters}
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
                <Select
                  value={sort}
                  onChange={this.handleFilters}
                  input={<Input name="sort" id="sort-helper" />}
                >
                  <MenuItem value="date">Date</MenuItem>
                  {/* <MenuItem value="comments">Comments</MenuItem> */}
                  <MenuItem value="tweets">Tweets</MenuItem>
                  <MenuItem value="bookmarks">Stars</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container direction="row" key={scrollID}>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadPapers}
              hasMore={this.state.hasMorePapers}
              loader={
                <div
                  key={0}
                  className={
                    isLoading ? classes.spinnerEmptyState : classes.spinner
                  }
                >
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
  }
}

export default withStyles(styles)(withRouter(PapersList));
