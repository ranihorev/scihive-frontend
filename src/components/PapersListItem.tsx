/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Card, CardActions, CardContent, Divider, Grid, IconButton, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TextTruncate from 'react-text-truncate';
import { Group, PaperListItem } from '../models';
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
  groups: Group[];
  showAbstract?: boolean;
  showMetadata?: boolean;
}

const SingleGroupMarker: React.FC<{ group?: Group; index: number }> = ({ group, index }) => {
  const [isHover, setIsHover] = React.useState(false);
  if (group) {
    return (
      <Link
        to={`/list/${group.id}/`}
        css={css`
          ${presets.simpleLink};
          border-radius: 0 0 3px 3px;
          max-width: 100px;
          min-width: 50px;
          font-size: 10px;
          margin-right: 5px;
          padding: 1px;
          text-align: center;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: 500;
          color: white;
          pointer: cursor;
        `}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          backgroundColor: presets.getGroupColor(group.color),
          height: isHover ? 'auto' : 6,
        }}
      >
        {isHover ? group.name : ''}
      </Link>
    );
  }
  return null;
};

const GroupMarkers: React.FC<{ paperGroupIds: string[]; groups: Group[] }> = ({ paperGroupIds, groups }) => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: row-reverse;
        position: absolute;
        top: 0;
        right: 10px;
      `}
    >
      {paperGroupIds.map((groupId, index) => (
        <SingleGroupMarker group={groups.find(g => g.id === groupId)} index={index} key={groupId} />
      ))}
    </div>
  );
};

const PaperMetadata: React.FC<{ paper: PaperListItem }> = ({ paper }) => {
  const { comments_count, twtr_score, twtr_links, bookmarks_count, github } = paper;
  return (
    <React.Fragment>
      <span data-rh="Paper comments" data-rh-at="top">
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
      <span data-rh="Users bookmarked" data-rh-at="top">
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
      <div data-rh="Σ Likes, RTs and replies" data-rh-at="top">
        <TwitterMeta twtr_score={twtr_score} twtr_links={twtr_links} iconCss={metadataCss} />
      </div>
      {!isEmpty(github) && (
        <div data-rh="Github stars (by PapersWithCode)" data-rh-at="top">
          <CodeMetaRender data={github} iconCss={metadataCss} />
        </div>
      )}
    </React.Fragment>
  );
};

const ExpandPaper: React.FC<{ expanded: boolean; handleExpandClick: (e: React.MouseEvent) => void }> = ({
  expanded,
  handleExpandClick,
}) => (
  <IconButton
    css={expanded ? expandedOpenCss : expandCss}
    onClick={handleExpandClick}
    aria-expanded={expanded}
    aria-label="Show more"
    size="small"
  >
    <ExpandMoreIcon
      fontSize="small"
      css={css`
        padding: ${presets.smallIconPadding}px;
      `}
    />
  </IconButton>
);

const PapersListItem: React.FC<PapersListItemProps> = ({ paper, groups, showAbstract = true, showMetadata = true }) => {
  const { saved_in_library: isBookmarked, github } = paper;
  const [expanded, setExpanded] = useState(false);
  const params = useParams<{ groupId?: string }>();

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <Card
      css={css`
        margin: 10px 0;
        width: 100%;
        position: relative;
        padding: 16px 0;
      `}
    >
      <GroupMarkers groups={groups} paperGroupIds={paper.groups} />
      <CardContent
        css={css`
          position: relative;
          padding-bottom: 12px;
          padding-top: 0;
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
              margin-right: 40px;
            `}
          >
            <Link
              to={`/paper/${paper._id}?${params.groupId ? `list=${params.groupId}` : ``}`}
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
                margin-right: 40px;
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
        {!showMetadata && (
          <div
            css={css`
              position: absolute;
              bottom: -8px;
              right: 8px;
            `}
          >
            <ExpandPaper {...{ expanded, handleExpandClick }} />
          </div>
        )}
      </CardContent>
      <div
        css={css`
          position: absolute;
          right: 8px;
          top: 8px;
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
      </div>

      {showMetadata && (
        <CardActions
          disableSpacing
          css={css`
            display: flex;
            padding-top: 0;
          `}
        >
          <PaperMetadata paper={paper} />
          <ExpandPaper {...{ expanded, handleExpandClick }} />
        </CardActions>
      )}

      {(showAbstract || expanded) && (
        <React.Fragment>
          <Divider variant="middle" />
          <CardContent style={{ paddingBottom: 0 }}>
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
        </React.Fragment>
      )}
    </Card>
  );
};

export default PapersListItem;
