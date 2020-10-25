/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { T_NewHighlight } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { presets } from '../../utils';
import { EditHighlight } from './EditHighlight';
import styles from './NewHighlight.module.scss';
import { useProtectedFunc } from '../../utils/useProtectFunc';

export const CompactTip: React.FC<{ isOnboarding: boolean; expandToComment: () => void }> = ({
  isOnboarding,
  expandToComment,
}) => {
  const { id: paperId, tempHighlight, commentVisibility, addHighlight } = usePaperStore(state => {
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
  const { protectFunc } = useProtectedFunc();
  const onHighlight = async () => {
    if (!tempHighlight) return;
    const data: T_NewHighlight = {
      text: '',
      visibility: commentVisibility,
      highlighted_text: tempHighlight.highlighted_text,
      position: tempHighlight.position,
    };
    await addHighlight(paperId, data, true);
  };

  return (
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
      {isOnboarding ? (
        <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 200, marginBottom: 12, textAlign: 'center' }}>
          Join the conversation - comment and highlight privately or with your peers
        </div>
      ) : (
        undefined
      )}
      <div className="flex flex-row justify-center">
        <CompactTipButton
          onClick={() => {
            protectFunc(expandToComment);
          }}
          icon="fas fa-comment-medical"
          text="Comment"
        />
        <CompactTipButton onClick={() => protectFunc(onHighlight)} icon="fas fa-highlighter" text="Highlight" />
      </div>
    </div>
  );
};

const CompactTipButton: React.FC<{ onClick: (e: React.MouseEvent) => void; icon: string; text: string }> = ({
  onClick,
  icon,
  text,
}) => (
  <div className={styles.compactTipButton} role="button" onClick={onClick}>
    <i className={icon} css={{ marginRight: 6 }} />
    <div>{text}</div>
  </div>
);

interface NewHighlightPopupProps {
  updateTipPosition: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  isOnboarding?: boolean;
}

export const NewHighlightPopup: React.FC<NewHighlightPopupProps> = ({
  updateTipPosition,
  onMouseDown = () => {},
  isOnboarding = false,
}) => {
  const [type, setType] = React.useState<'compact' | 'comment'>('compact');
  const { id: paperId, tempHighlight, addHighlight } = usePaperStore(state => {
    return {
      ...pick(state, ['id', 'tempHighlight', 'addHighlight']),
    };
  }, shallow);

  const onSubmit = (text: string) => {
    if (tempHighlight) {
      addHighlight(paperId, {
        text: text,
        highlighted_text: tempHighlight.highlighted_text,
        position: tempHighlight.position,
        visibility: { type: 'public' },
      });
    }
  };

  React.useEffect(() => {
    updateTipPosition();
  }, [type, updateTipPosition]);

  return (
    <div className="Tip" onMouseDown={onMouseDown}>
      {type === 'compact' ? (
        <CompactTip isOnboarding={isOnboarding} expandToComment={() => setType('comment')} />
      ) : (
        <div className={styles.newComment}>
          <EditHighlight onSubmit={onSubmit} />
        </div>
      )}
    </div>
  );
};
