/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import {
  Card,
  Typography,
  IconButton,
  CardActions,
  Grid,
  Divider,
  CardContent,
  Button,
  withStyles,
  Tooltip,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import TextTruncate from 'react-text-truncate';
import TwitterMeta from './TwitterMeta';
import Bookmark from './Bookmark';
import * as presets from '../utils/presets';
import { Latex } from '../utils/latex';
import CodeMeta from './CodeMeta';

const MAIN_COLOR = presets.themePalette.primary.main;

const styles = () => ({
  root: {
    margin: '10px 0',
    width: '100%',
  },
  header: {
    // padding: 5,
    position: 'relative',
  },
  content: {
    paddingBottom: 0,
  },
  author: {
    color: '#656565',
    textDecoration: 'none',
    '&:hover': {
      color: '#878787',
      textDecoration: 'underline',
    },
  },
  authors: {
    marginTop: 12,
    marginBottom: 12,
  },
  date: {
    color: '#656565',
    fontSize: 11,
  },
  actions: {
    display: 'flex',
  },
  metadata: {
    marginRight: '6px',
    color: MAIN_COLOR,
  },
  summary: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.46429em',
  },
  readMore: {
    textDecoration: 'none',
    color: '#8a8a8a',
  },
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
  const { saved_in_library, comments_count, twtr_score, twtr_links, bookmarks_count, github } = paper;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = e => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <Card classes={{ root: classes.root }}>
      <CardContent className={classes.content}>
        <Grid container className={classes.header} direction="row" justify="space-between">
          <Grid
            item
            css={css`
              margin-right: 40;
            `}
          >
            <Link
              to={`/paper/${paper._id}`}
              css={css`
                color: #333;
                font-weight: 500;
                text-decoration: none;
                &:hover: {
                  color: #878787;
                }
              `}
            >
              <Latex>{paper.title}</Latex>
            </Link>
          </Grid>
          <Grid
            item
            css={css`
              position: absolute;
              right: -8px;
              top: -12px;
            `}
          >
            <svg width="20" height="20" viewBox="0 0 1024 1024" version="1.1">
              <path d="M405.952 438.24c-80.544 0-143.84-63.264-143.84-143.84a142.464 142.464 0 0 1 143.84-143.84c12.128 0 23.648 1.856 34.816 4.576a259.84 259.84 0 0 1 46.592-44.064 195.936 195.936 0 0 0-81.44-17.984c-109.344 0-201.344 92.032-201.344 201.344 0 69.024 34.528 126.592 86.304 161.088C141.344 507.296 32 645.376 32 812.192c0 17.216 11.52 28.736 28.768 28.736s28.768-11.52 28.768-28.736c0-172.608 143.84-316.416 316.416-316.416 14.56 0 28.768-1.728 42.56-4.8a259.52 259.52 0 0 1-36.96-53.248c-1.92 0.032-3.68 0.512-5.6 0.512zM955.584 755.776H809.92v-145.632c0-21.856-14.56-36.416-36.384-36.416-21.888 0-36.448 14.56-36.448 36.416v145.632h-145.632c-21.856 0-36.416 14.56-36.416 36.448 0 21.824 14.56 36.384 36.416 36.384h145.632v145.664c0 21.856 14.56 36.416 36.448 36.416 21.824 0 36.384-14.56 36.384-36.416v-145.664h145.664c21.856 0 36.416-14.56 36.416-36.384 0-21.888-14.56-36.448-36.416-36.448zM972.864 300.224c0-138.368-116.512-254.848-254.88-254.848s-254.848 116.512-254.848 254.848c0 87.36 43.68 160.192 109.248 203.904-189.344 65.536-327.68 240.32-327.68 451.456-0.032 21.856 14.56 36.416 36.384 36.416s36.416-14.56 36.416-36.416c0-218.464 182.048-400.512 400.512-400.512 138.368 0.032 254.848-116.48 254.848-254.848z m-436.928 0c0-101.952 80.128-182.048 182.048-182.048s182.048 80.096 182.048 182.048-80.128 182.048-182.048 182.048-182.048-80.096-182.048-182.048z"/>
            </svg>
            <Bookmark paperId={paper._id} saved_in_library={saved_in_library} selectedColor={MAIN_COLOR} />
          </Grid>
        </Grid>
        <Grid container className={classes.authors}>
          <Grid item>
            <Typography>
              {paper.authors.map((author, index) => (
                <React.Fragment key={index}>
                  <Link to={`/author/${author.name}`} className={classes.author}>
                    {author.name}
                  </Link>
                  {index < paper.authors.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </Typography>
            <Typography className={classes.date}>{moment(paper.time_published).format('MMM DD, YYYY')}</Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableActionSpacing className={classes.actions}>
        <Tooltip title="Paper comments" placement="top">
          <span>
            <Button
              disabled={true}
              size="small"
              css={css`
                padding: 0 4px;
              `}
            >
              <i className={`fas fa-comments ${classes.metadata}`} /> {comments_count || '0'}
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Users bookmarked" placement="top">
          <span>
            <Button
              disabled={true}
              size="small"
              css={css`
                padding: 0 4px;
              `}
            >
              <i className={`fa fa-star ${classes.metadata}`} /> {bookmarks_count || '0'}
            </Button>
          </span>
        </Tooltip>
        <div>
          <Tooltip title="Σ Likes, RTs and replies" placement="top">
            <span>
              <TwitterMeta twtr_score={twtr_score} twtr_links={twtr_links} iconClass={classes.metadata} />
            </span>
          </Tooltip>
        </div>
        {!isEmpty(github) && (
          <Tooltip title="Github stars (by PapersWithCode)" placement="top">
            <span>
              <CodeMeta data={github} iconClass={classes.metadata} />
            </span>
          </Tooltip>
        )}
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
          <div className={classes.summary}>
            <Latex>{paper.summary}</Latex>
            {!isEmpty(github) && (
              <div
                css={css`
                  font-size: 12px;
                  margin-top: 5px;
                  color: grey;
                `}
              >
                * Github link is provided by{' '}
                <a
                  href="https://www.paperswithcode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  css={css`
                    color: inherit;
                  `}
                >
                  PapersWithCode
                </a>
              </div>
            )}
          </div>
        ) : (
          <TextTruncate
            line={2}
            element="div"
            truncateText="…"
            className={classes.summary}
            text={paper.summary}
            textTruncateChild={
              <button type="button" css={presets.linkButton} className={classes.readMore} onClick={handleExpandClick}>
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
