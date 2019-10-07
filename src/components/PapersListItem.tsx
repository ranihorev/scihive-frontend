/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TextTruncate from 'react-text-truncate';
import { PaperListItem } from '../models';
import { Latex } from '../utils/latex';
import * as presets from '../utils/presets';
import Bookmark from './Bookmark';
import CodeMetaRender from './CodeMeta';
import TwitterMeta from './TwitterMeta';

const MAIN_COLOR = presets.themePalette.primary.main;

const paragraphCss = css`
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.46429em;
`;

const metadataCss = css`
  margin-right: 6px;
  color: ${MAIN_COLOR};
`;

const expandCss = css`
  transform: rotate(0deg);
  margin-left: auto;
  transition: transform 0.2s;
`;

const expandedOpenCss = css`
  ${expandCss};
  transform: rotate(180deg);
`;

interface PapersListItemProps {
  paper: PaperListItem;
}

const PapersListItem: React.FC<PapersListItemProps> = ({ paper }) => {
  const { saved_in_library: isBookmarked, comments_count, twtr_score, twtr_links, bookmarks_count, github } = paper;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <Card
      css={css`
        margin: 10px 0;
        width: 100%;
      `}
    >
      <CardContent
        css={css`
          padding-bottom: 0;
        `}
      >
        <Grid
          container
          css={css`
            position: relative;
          `}
          direction="row"
          justify="space-between"
        >
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
              ${presets.col};
              align-items: center;
            `}
          >
            <Bookmark
              paperId={paper._id}
              size={20}
              isBookmarked={isBookmarked}
              selectedGroupIds={paper.groups}
              type="list"
            />
          </Grid>
        </Grid>
        <Grid
          container
          css={css`
            margin-top: 12px;
          `}
        >
          <Grid item>
            <Typography
              css={css`
                ${paragraphCss};
                margin-bottom: 4px;
              `}
            >
              {paper.authors.map((author, index) => (
                <React.Fragment key={index}>
                  <Link
                    to={`/author/${author.name}`}
                    css={css`
                      color: #656565;
                      text-decoration: none;
                      &:hover {
                        color: #878787;
                        text-decoration: underline;
                      }
                    `}
                  >
                    {author.name}
                  </Link>
                  {index < paper.authors.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </Typography>
            <Typography
              css={css`
                color: #656565;
                font-size: 11px;
              `}
            >
              {moment(paper.time_published).format('MMM DD, YYYY')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions
        disableSpacing
        css={css`
          display: flex;
        `}
      >
        <Tooltip title="Paper comments" placement="top">
          <span>
            <Button
              disabled={true}
              size="small"
              css={css`
                padding: 0 4px;
              `}
            >
              <i className="fas fa-comments" css={metadataCss} /> {comments_count || '0'}
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
              <i className="fa fa-star" css={metadataCss} /> {bookmarks_count || '0'}
            </Button>
          </span>
        </Tooltip>
        <div>
          <Tooltip title="Σ Likes, RTs and replies" placement="top">
            <span>
              <TwitterMeta twtr_score={twtr_score} twtr_links={twtr_links} iconCss={metadataCss} />
            </span>
          </Tooltip>
        </div>
        {!isEmpty(github) && (
          <Tooltip title="Github stars (by PapersWithCode)" placement="top">
            <span>
              <CodeMetaRender data={github} iconCss={metadataCss} />
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
          <div css={paragraphCss}>
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
            css={paragraphCss}
            text={paper.summary}
            textTruncateChild={
              <button
                type="button"
                css={css`
                  ${presets.linkButton};
                  text-decoration: none;
                  color: #8a8a8a;
                `}
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

export default PapersListItem;
