/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Typography } from '@material-ui/core';
import { pick } from 'lodash';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { Latex } from '../../../utils/latex';
import { MetadataEditor } from './MetadataEditor';

const sectionCss = css({ marginBottom: 12, lineHeight: 1.4, wordBreak: 'break-word', hyphens: 'auto' });

const InfoInternal: React.FC = () => {
  const { title, authors, time_published, abstract } = usePaperStore(
    state => pick(state, ['title', 'authors', 'time_published', 'abstract']),
    shallow,
  );
  return (
    <React.Fragment>
      <Typography css={{ color: '#333', fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
        <Latex>{title || ''}</Latex>
      </Typography>
      <div css={{ fontSize: 13, color: '#656565' }}>
        <div css={sectionCss}>
          <div css={{ fontWeight: 500 }}>Authors</div>
          {authors.map((author, index) => (
            <React.Fragment key={index}>
              <Link
                to={`/author/${author.name}`}
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
        </div>
        <div css={sectionCss}>
          <div css={{ fontWeight: 500 }}>Published</div>
          {time_published && moment.utc(time_published).format('MMM DD, YYYY')}
        </div>
        <div css={sectionCss}>
          <div css={{ fontWeight: 500 }}>Abstract</div>
          <Latex>{abstract || ''}</Latex>
        </div>
      </div>
    </React.Fragment>
  );
};

export const Info: React.FC = () => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const isEditable = usePaperStore(state => state.isEditable, shallow);
  return (
    <div css={[presets.col, { padding: `16px 12px`, overflowY: 'auto', paddingBottom: 24 }]}>
      {isEditOpen ? (
        <MetadataEditor onClose={() => setIsEditOpen(false)} />
      ) : (
        <React.Fragment>
          <InfoInternal />
          {isEditable && (
            <React.Fragment>
              <div>
                <Button variant="contained" color="primary" size="small" onClick={() => setIsEditOpen(true)}>
                  Edit
                </Button>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </div>
  );
};
