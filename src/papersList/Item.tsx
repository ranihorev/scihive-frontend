/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Divider, IconButton, Link, Tooltip, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import baseStyles from '../base.module.scss';
import { Bookmark } from '../bookmark';
import { Group, PaperListItem } from '../models';
import { Latex } from '../utils/latex';
import { arrowTooltipsClasses as arrowTooltipClasses } from '../utils/presets';
import { QueryContext } from '../utils/QueryContext';
import { Spacer } from '../utils/Spacer';
import {
  addOrRemovePaperToGroupRequest,
  addRemoveGroupFromPapersListCache,
  OnSelectGroupProps,
} from '../utils/useGroups';
import { GroupMarkers } from './ItemGroups';
import styles from './styles.module.scss';
import { HelpTooltip } from '../utils/HelpTooltip';
import cx from 'classnames';

const metadataCss = css`
  margin-right: 6px;
`;

interface PapersListItemProps {
  paper: PaperListItem;
  groups: Group[];
}

const SingleMetadata: React.FC<{ tooltip: string; icon: string }> = ({ tooltip, icon, children }) => {
  return (
    <Tooltip title={tooltip} placement="top" arrow classes={arrowTooltipClasses}>
      <Typography variant="body2" className="text-gray-500">
        <i className={icon} css={metadataCss} /> {children}
      </Typography>
    </Tooltip>
  );
};

const PaperMetadata: React.FC<{ paper: PaperListItem }> = ({ paper }) => {
  const { comments_count, twitter_score, num_stars, code } = paper;
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
      {code?.github && (
        <SingleMetadata tooltip="Github stars (by PapersWithCode)" icon="fab fa-github">
          {code?.stars || 0}
        </SingleMetadata>
      )}
    </React.Fragment>
  );
};

const ExpandPaper: React.FC<{ expanded: boolean; handleExpandClick: (e: React.MouseEvent) => void }> = ({
  expanded,
  handleExpandClick,
}) => (
  <HelpTooltip title={expanded ? 'Close abstract' : 'Expand Abstract'}>
    <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="Show more" size="small" edge="end">
      <ExpandMoreIcon
        fontSize="small"
        className={cx('transition-transform duration-300', expanded ? 'transform rotate-180' : undefined)}
      />
    </IconButton>
  </HelpTooltip>
);

export const Item: React.FC<PapersListItemProps> = ({ paper, groups }) => {
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
    <div className="relative border-t border-gray-200 rounded-none">
      <GroupMarkers groups={groups} paperGroupIds={paper.groups} />
      <div className="pt-5 pb-4">
        <div className={styles.itemTitleSection}>
          <Link variant="h6" color="textPrimary" component={RouterLink} to={`/paper/${paper.id}`}>
            <Latex>{paper.title}</Latex>
          </Link>
          <Bookmark
            className={styles.itemBookmark}
            edge="end"
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
                to={`/discover/?author=${author.name}`}
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
          <Spacer size={1} grow />
          <ExpandPaper {...{ expanded, handleExpandClick }} />
        </div>
        {expanded && (
          <React.Fragment>
            <Typography variant="body2" className="pt-2">
              <span className="leading-relaxed text-gray-700">
                <Latex>{paper.abstract}</Latex>
              </span>
            </Typography>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
