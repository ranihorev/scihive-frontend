/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { EditHighlightData, T_NewHighlight } from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { EditHighlight } from '../../EditHighlight';
import { VisibilityControl } from '../../EditHighlight/VisibilityControl';

interface TipProps {
  updateTipPosition: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  isOnboarding?: boolean;
}

export const CompactTip: React.FunctionComponent = ({ children }) => (
  <div
    css={css`
      ${presets.col};
      justify-content: center;
      color: white;
      padding: 10px;
      background-color: #213344;
      border-radius: 8px;
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
    css={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 14,
      cursor: 'pointer',
      padding: 3,
      '&:hover': { color: presets.themePalette.primary.main },
      '&:not(:last-child)': {
        marginRight: 8,
      },
    }}
    role="button"
    onClick={onClick}
  >
    <i className={icon} css={{ marginRight: 6 }} />
    <div>{text}</div>
  </div>
);

const Tip: React.FC<TipProps> = ({ updateTipPosition, onMouseDown = () => {}, isOnboarding = false }) => {
  const [type, setType] = React.useState<'compact' | 'highlight' | 'comment'>('compact');
  const newHighlightId = React.useRef<string | undefined>();
  // const isLoggedIn = useUserStore(state => Boolean(state.userData));
  const {
    id: paperId,
    tempHighlight,
    commentVisibility,
    addHighlight,
    updateHighlight,
    setCommentVisibilitySettings,
  } = usePaperStore(state => {
    return {
      ...pick(state, [
        'id',
        'tempHighlight',
        'commentVisibility',
        'addHighlight',
        'updateHighlight',
        'setCommentVisibilitySettings',
      ]),
    };
  }, shallow);

  const onSubmit = ({ text, visibility }: EditHighlightData) => {
    setCommentVisibilitySettings(visibility);
    if (tempHighlight) {
      addHighlight(paperId, {
        text: text,
        visibility,
        highlighted_text: tempHighlight.highlighted_text,
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
          {isOnboarding ? (
            <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 200, marginBottom: 12, textAlign: 'center' }}>
              Join the conversation - comment and highlight privately or with your peers
            </div>
          ) : (
            undefined
          )}
          <div css={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
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
                  text: '',
                  visibility: commentVisibility,
                  highlighted_text: tempHighlight.highlighted_text,
                  position: tempHighlight.position,
                };
                const highlight = await addHighlight(paperId, data, false);
                newHighlightId.current = highlight.id;
                setType('highlight');
              }}
              icon="fas fa-highlighter"
              text="Highlight"
            />
          </div>
        </CompactTip>
      ) : type === 'comment' ? (
        <EditHighlight onSubmit={onSubmit} visibilitySettings={commentVisibility} />
      ) : (
        <Paper css={{ padding: 10 }}>
          <VisibilityControl
            visibilitySettings={commentVisibility}
            setCommentVisibility={visibility => {
              if (newHighlightId.current !== undefined) {
                setCommentVisibilitySettings(visibility);
                updateHighlight(newHighlightId.current, { text: '', visibility });
              }
            }}
          />
        </Paper>
      )}
    </div>
  );
};

export default Tip;
