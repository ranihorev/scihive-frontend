/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import CardContent from '@material-ui/core/CardContent';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import TextTruncate from 'react-text-truncate';
import TwitterMeta from './TwitterMeta';
import Bookmark from './Bookmark';
import * as presets from '../utils/presets';

const MAIN_COLOR = '#49a8f5';

const styles = theme => ({
  root: {
    margin: '10px 0',
    width: '100%'
  },
  header: {
    // padding: 5,
    position: 'relative'
  },
  content: {
    paddingBottom: 0
  },
  titleWrapper: {
    marginRight: 40
  },
  title: {
    color: '#333',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      color: '#878787'
    }
  },
  author: {
    color: '#656565',
    textDecoration: 'none',
    '&:hover': {
      color: '#878787',
      textDecoration: 'underline'
    }
  },
  bookmark: {
    position: 'absolute',
    right: -8,
    top: -12
    // marginLeft: "auto"
  },
  authors: {
    marginTop: 12,
    marginBottom: 12
  },
  date: {
    color: '#656565',
    fontSize: 11
  },
  actions: {
    display: 'flex'
  },
  metadata: {
    marginRight: '6px',
    color: MAIN_COLOR
  },
  summary: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.46429em'
  },
  readMore: {
    textDecoration: 'none',
    color: '#8a8a8a'
  }
});

const expandCss = css`
  transform: rotate(0deg);
  margin-left: auto;
  transition: transform 0.2s;
`;

const expandedOpenCss = css`
  ${expandCss};
  transform: rotate(180deg);
`;

const PapersListItem = ({ paper, classes }) => {
  const {
    saved_in_library,
    comments_count,
    twtr_score,
    twtr_links,
    bookmarks_count
  } = paper;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = e => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <Card classes={{ root: classes.root }}>
      <CardContent className={classes.content}>
        <Grid
          container
          className={classes.header}
          direction="row"
          justify="space-between"
        >
          <Grid item className={classes.titleWrapper}>
            <Link to={`/paper/${paper._id}`} className={classes.title}>
              {paper.title}
            </Link>
          </Grid>
          <Grid item className={classes.bookmark}>
            <Bookmark
              paperId={paper._id}
              saved_in_library={saved_in_library}
              selectedColor={MAIN_COLOR}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.authors}>
          <Grid item>
            <Typography>
              {paper.authors.map((author, index) => (
                <React.Fragment key={index}>
                  <Link
                    to={`/author/${author.name}`}
                    className={classes.author}
                  >
                    {author.name}
                  </Link>
                  {index < paper.authors.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </Typography>
            <Typography className={classes.date}>
              {moment(paper.time_published).format('MMM DD, YYYY')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableActionSpacing className={classes.actions}>
        <Button disabled={true}>
          <i className={`fas fa-comments ${classes.metadata}`} />{' '}
          {comments_count || '0'}
        </Button>
        <Button disabled={true}>
          <i className={`fa fa-star ${classes.metadata}`} />{' '}
          {bookmarks_count || '0'}
        </Button>
        <div>
          <TwitterMeta
            twtr_score={twtr_score}
            twtr_links={twtr_links}
            iconClass={classes.metadata}
          />
        </div>
        <IconButton
          css={expanded ? expandedOpenCss : expandCss}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="Show more"
        >
          <ExpandMoreIcon />
        </IconButton>{' '}
      </CardActions>
      <Divider variant="middle" />
      <CardContent>
        {expanded ? (
          <div className={classes.summary}>{paper.summary}</div>
        ) : (
          <TextTruncate
            line={2}
            element="div"
            truncateText="…"
            className={classes.summary}
            text={paper.summary}
            textTruncateChild={
              <button
                type="button"
                css={presets.linkButton}
                className={classes.readMore}
                onClick={handleExpandClick}
              >
                Read more
              </button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(PapersListItem);
