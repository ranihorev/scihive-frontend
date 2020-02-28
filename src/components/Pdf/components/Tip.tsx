/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { EditHighlightData, T_NewHighlight } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { usePaperId } from '../../../utils/hooks';
import { EditHighlight } from '../../EditHighlight';
import { VisibilityControl } from '../../EditHighlight/VisibilityControl';

interface TipProps {
  updateTipPosition: () => void;
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

const Tip: React.FC<TipProps> = ({ updateTipPosition, onMouseDown = () => {} }) => {
  const [type, setType] = React.useState<'compact' | 'highlight' | 'comment'>('compact');
  const paperId = usePaperId();
  const newHighlightId = React.useRef<string | undefined>();
  // const isLoggedIn = useUserStore(state => Boolean(state.userData));
  const {
    tempHighlight,
    commentVisibility,
    addHighlight,
    updateHighlight,
    clearTempHighlight,
    setCommentVisibilitySettings,
  } = usePaperStore(state => {
    return {
      ...pick(state, [
        'tempHighlight',
        'commentVisibility',
        'addHighlight',
        'updateHighlight',
        'clearTempHighlight',
        'setCommentVisibilitySettings',
      ]),
    };
  }, shallow);

  const onSubmit = ({ text, visibility }: EditHighlightData) => {
    setCommentVisibilitySettings(visibility);
    if (tempHighlight) {
      addHighlight(paperId, {
        comment: { text },
        visibility,
        content: tempHighlight.content,
        position: tempHighlight.position,
      });
    }
  };

  React.useEffect(() => {
    updateTipPosition();
  }, [type]);

  return (
    <div className="Tip" onMouseDown={onMouseDown}>
      {type === 'compact' ? (
        <CompactTip>
          <CompactTipButton
            onClick={() => {
              setType('comment');
            }}
            icon="fas fa-comment-medical"
            text="Comment"
          />
          <CompactTipButton
            onClick={async () => {
              if (!tempHighlight) return;
              const data: T_NewHighlight = {
                comment: { text: '' },
                visibility: commentVisibility,
                content: tempHighlight.content,
                position: tempHighlight.position,
              };
              const highlight = await addHighlight(paperId, data, false);
              newHighlightId.current = highlight.id;
              setType('highlight');
            }}
            icon="fas fa-highlighter"
            text="Highlight"
          />
        </CompactTip>
      ) : type === 'comment' ? (
        <EditHighlight onSubmit={onSubmit} visibilitySettings={commentVisibility} />
      ) : (
        <Paper css={{ padding: 10 }}>
          <VisibilityControl
            visibilitySettings={commentVisibility}
            setCommentVisibility={visibility => {
              if (newHighlightId.current !== undefined) {
                updateHighlight(newHighlightId.current, { text: '', visibility });
                clearTempHighlight();
              }
            }}
          />
        </Paper>
      )}
    </div>
  );
};

export default Tip;
