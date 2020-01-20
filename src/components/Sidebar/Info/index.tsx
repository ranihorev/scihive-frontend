/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Typography, Button } from '@material-ui/core';
import { pick } from 'lodash';
import moment from 'moment';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { Latex } from '../../../utils/latex';
import { Link } from 'react-router-dom';
import { EditModal } from './EditModal';

const sectionCss = css({ marginBottom: 12, lineHeight: 1.4, wordBreak: 'break-word', hyphens: 'auto' });

export const Info: React.FC = () => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { title, authors, date, summary, isEditable } = usePaperStore(
    state => pick(state, ['title', 'authors', 'date', 'summary', 'isEditable']),
    shallow,
  );
  return (
    <div css={[presets.col, { padding: `16px 12px`, overflowY: 'auto', paddingBottom: 24 }]}>
      <div>
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
            {moment.utc(date).format('MMM DD, YYYY')}
          </div>
          <div css={sectionCss}>
            <div css={{ fontWeight: 500 }}>Summary</div>
            {summary}
          </div>
        </div>
      </div>
      {isEditable && (
        <>
          <div>
            <Button variant="contained" color="primary" size="small" onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
          </div>
          <EditModal isOpen={isEditOpen} closeModal={() => setIsEditOpen(false)} />
        </>
      )}
    </div>
  );
};
