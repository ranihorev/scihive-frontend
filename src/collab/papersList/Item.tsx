/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Card, CardContent, Divider, IconButton, Link, Tooltip, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import baseStyles from '../../base.module.scss';
import { Group, PaperListItem } from '../../models';
import { Latex } from '../../utils/latex';
import { arrowTooltipsClasses as arrowTooltipClasses } from '../../utils/presets';
import { Bookmark } from '../bookmark';
import { QueryContext } from '../utils/QueryContext';
import { Spacer } from '../utils/Spacer';
import {
  addOrRemovePaperToGroupRequest,
  addRemoveGroupFromPapersListCache,
  OnSelectGroupProps,
} from '../utils/useGroups';
import { GroupMarkers } from './ItemGroups';
import styles from './styles.module.scss';

const paragraphCss = css`
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.46429em;
`;

const metadataCss = css`
  margin-right: 6px;
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
}

const SingleMetadata: React.FC<{ tooltip: string; icon: string }> = ({ tooltip, icon, children }) => {
  return (
    <Tooltip title={tooltip} placement="top" arrow classes={arrowTooltipClasses}>
      <Typography color="textSecondary" variant="body2">
        <i className={icon} css={metadataCss} /> {children}
      </Typography>
    </Tooltip>
  );
};

const PaperMetadata: React.FC<{ paper: PaperListItem }> = ({ paper }) => {
  const { comments_count, twitter_score, num_stars } = paper;
  return (
    <React.Fragment>
      <SingleMetadata tooltip="Comments" icon="fas fa-comments">
        {comments_count || '0'}
      </SingleMetadata>
      <Spacer size={16} />
      <SingleMetadata tooltip="Collections the paper belongs to" icon="fa fa-star">
        {num_stars || '0'}
      </SingleMetadata>
      <Spacer size={16} />
      <SingleMetadata tooltip="Likes, retweets and replies" icon="fab fa-twitter">
        {twitter_score}
      </SingleMetadata>
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
    <ExpandMoreIcon fontSize="small" />
  </IconButton>
);

export const Item: React.FC<PapersListItemProps> = ({ paper, groups }) => {
  const { code: github } = paper;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  const queryContext = React.useContext(QueryContext);

  const [onSelectGroup] = useMutation(
    async (props: OnSelectGroupProps) => {
      return addOrRemovePaperToGroupRequest({ paperId: paper.id, ...props });
    },
    {
      onMutate: ({ shouldAdd, groupId }) => {
        const queryKey = ['papers', queryContext.query];
        addRemoveGroupFromPapersListCache({ queryKey, groupId, shouldAdd, paperId: paper.id });
        return () => addRemoveGroupFromPapersListCache({ queryKey, groupId, shouldAdd: !shouldAdd, paperId: paper.id });
      },
      onError: (err, props, rollback: () => void) => {
        rollback();
        toast.error('Failed to update collection');
      },
    },
  );

  return (
    <Card className={styles.itemCard}>
      <GroupMarkers groups={groups} paperGroupIds={paper.groups} />
      <CardContent classes={{ root: styles.itemCardContent }}>
        <div className={styles.itemTitleSection}>
          <Link variant="h6" color="textPrimary" component={RouterLink} to={`/collab/paper/${paper.id}`}>
            <Latex>{paper.title}</Latex>
          </Link>
          <Bookmark
            className={styles.itemBookmark}
            paperId={paper.id}
            size={20}
            selectedGroupIds={paper.groups}
            onSelectGroup={props => {
              onSelectGroup(props);
            }}
            type="list"
          />
        </div>
        <Spacer size={8} />
        <Typography component="div" variant="body2" color="textSecondary">
          {paper.authors.map((author, index) => (
            <React.Fragment key={index}>
              <Link
                component={RouterLink}
                variant="body2"
                color="textSecondary"
                to={`/collab/discover/?author=${author.name}`}
              >
                {author.name}
              </Link>
              {index < paper.authors.length - 1 ? <React.Fragment>,&nbsp;</React.Fragment> : ''}
            </React.Fragment>
          ))}
        </Typography>
        <Spacer size={4} />
        <Typography variant="body2" color="textSecondary">
          {moment.utc(paper.time_published).format('MMM DD, YYYY')}
        </Typography>

        <Spacer size={12} />
        <div className={baseStyles.centeredRow}>
          <PaperMetadata paper={paper} />
          <ExpandPaper {...{ expanded, handleExpandClick }} />
        </div>
      </CardContent>

      {expanded && (
        <React.Fragment>
          <Spacer size={16} />
          <Divider variant="middle" />
          <CardContent style={{ paddingBottom: 0 }}>
            <div css={paragraphCss}>
              <Latex>{paper.abstract}</Latex>
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
          </CardContent>
        </React.Fragment>
      )}
    </Card>
  );
};
