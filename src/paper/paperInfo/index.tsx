/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, Typography } from '@material-ui/core';
import { pick } from 'lodash';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../stores/paper';
import { Latex } from '../../utils/latex';
import { MetadataEditor } from './MetadataEditor';
import styles from './styles.module.scss';

const InfoItem: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <div className={styles.paperInfoItem}>
      <Typography>{title}</Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </div>
  );
};

const InfoInternal: React.FC = () => {
  const { title, authors, timePublished, abstract, doi } = usePaperStore(
    state => pick(state, ['title', 'authors', 'timePublished', 'abstract', 'doi']),
    shallow,
  );
  return (
    <React.Fragment>
      <Typography classes={{ root: styles.title }} gutterBottom variant="h6" className={styles.title}>
        <Latex>{title || ''}</Latex>
      </Typography>
      <div className={styles.paperInfoWrapper}>
        <InfoItem title="Authors">
          {authors.map((author, index) => (
            <React.Fragment key={index}>
              <Link
                to={`/discover/?author=${author.name}`}
                css={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#878787',
                    textDecoration: 'underline',
                  },
                }}
              >
                {author.name}
              </Link>
              {index < authors.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </InfoItem>
        <InfoItem title="Publish Date">{timePublished && moment.utc(timePublished).format('MMM DD, YYYY')}</InfoItem>
        {doi && <InfoItem title="DOI">{doi}</InfoItem>}
        <InfoItem title="Abstract">
          <Latex>{abstract || ''}</Latex>
        </InfoItem>
      </div>
    </React.Fragment>
  );
};

export const Info: React.FC = () => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const isEditable = usePaperStore(state => state.isEditable);
  return (
    <div className={styles.root}>
      {isEditOpen ? (
        <MetadataEditor onClose={() => setIsEditOpen(false)} />
      ) : (
        <React.Fragment>
          <InfoInternal />
          {isEditable && (
            <div>
              <Button variant="contained" color="primary" size="small" onClick={() => setIsEditOpen(true)}>
                Edit
              </Button>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
};
