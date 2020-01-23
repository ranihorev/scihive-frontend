/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { presets } from '../../../../utils';

interface Props {
  text: string;
}

const textMaxLen = 50;

export const Quote: React.FC<Props> = ({ text }) => {
  return (
    <div css={[presets.row, { position: 'relative' }]}>
      <blockquote
        css={css`
          font-size: 0.7rem;
          margin: 0;
          margin-bottom: 6px;
          font-style: italic;
          quotes: '\\201C''\\201D';
          &:before {
            content: open-quote;
            margin-right: -2px;
          }
          &:after {
            content: close-quote;
            margin-left: -2px;
          }
        `}
      >
        {' '}
        {text.slice(0, textMaxLen)}
        {text.length > textMaxLen ? '...' : ''}{' '}
      </blockquote>
    </div>
  );
};
