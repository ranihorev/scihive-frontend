/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { pick } from 'lodash';
import React from 'react';
import { useParams } from 'react-router';
import shallow from 'zustand/shallow';
import { T_NewHighlight, Visibility, EditHighlightData } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { EditHighlight } from '../../EditHighlight';

interface TipProps {
  onOpen: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const CompactTip: React.FunctionComponent = ({ children }) => (
  <div
    css={css`
      ${presets.col};
      color: white;
      padding: 7px 7px;
      background-color: #bbb;
      border-radius: 10px;
    `}
  >
    {children}
  </div>
);

const CompactTipButton: React.FC<{ onClick: (e: React.MouseEvent) => void; icon: string; text: string }> = ({
  onClick,
  icon,
  text,
}) => (
  <div
    css={[
      presets.row,
      {
        alignItems: 'center',
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: 5,
        padding: 3,
        '&:hover': { color: presets.themePalette.primary.main },
        '&:last-child': {
          marginBottom: 0,
        },
      },
    ]}
    role="button"
    onClick={onClick}
  >
    <i className={icon} css={{ marginRight: 6 }} />
    <div>{text}</div>
  </div>
);

const Tip: React.FC<TipProps> = ({ onOpen, onMouseDown = () => {} }) => {
  const [isCompact, setIsCompact] = React.useState(true);
  const params = useParams<{ PaperId: string }>();

  const { tempTooltipData, commentVisibilty, addHighlight, setCommentVisibilitySettings } = usePaperStore(
    state => pick(state, ['tempTooltipData', 'commentVisibilty', 'addHighlight', 'setCommentVisibilitySettings']),
    shallow,
  );

  const onSubmit = ({ text, visibility }: EditHighlightData) => {
    if (tempTooltipData) {
      const data: T_NewHighlight = {
        comment: { text },
        visibility,
        content: tempTooltipData.content,
        position: tempTooltipData.position,
      };
      setCommentVisibilitySettings(visibility);
      addHighlight(params.PaperId, data);
    }
  };

  return (
    <div className="Tip" onMouseDown={onMouseDown}>
      {isCompact ? (
        <CompactTip>
          <CompactTipButton
            onClick={() => {
              onOpen();
              setIsCompact(false);
            }}
            icon="fas fa-comment-medical"
            text="Comment"
          />
          <CompactTipButton
            onClick={() => onSubmit({ text: '', visibility: commentVisibilty })}
            icon="fas fa-highlighter"
            text="Highlight"
          />
        </CompactTip>
      ) : (
        <EditHighlight onSubmit={onSubmit} visibilitySettings={commentVisibilty} />
      )}
    </div>
  );
};

export default Tip;
