/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { presets } from '../../../utils';
import { ActionIconButton } from './ActionButton';
import { useParams } from 'react-router';
import { T_Highlight } from '../../../models';
import { usePaperStore } from '../../../stores/paper';

interface Props {
  text: string;
  highlight: T_Highlight;
}

const textMaxLen = 50;

export const Quote: React.FC<Props> = ({ text, highlight }) => {
  const params = useParams<{ PaperId: string }>();
  const [isHover, setIsHover] = React.useState(false);
  const removeHighlight = usePaperStore(state => state.removeHighlight);

  return (
    <div
      css={[presets.row, { position: 'relative' }]}
      onMouseEnter={() => highlight.canEdit && setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
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
      {highlight.canEdit && isHover && (
        <div
          css={{
            position: 'absolute',
            top: `calc(50% - 5px)`,
            transform: `translateY(-50%)`,
            right: -5,
            backgroundColor: 'rgba(249, 249, 249, 0.8)',
            borderRadius: 999,
          }}
        >
          <ActionIconButton
            onClick={e => {
              e.stopPropagation();
              removeHighlight(params.PaperId, highlight.id);
            }}
            name="far fa-trash-alt"
          />
        </div>
      )}
    </div>
  );
};
