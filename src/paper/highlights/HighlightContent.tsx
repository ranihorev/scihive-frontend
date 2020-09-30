/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import copy from 'clipboard-copy';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { T_Highlight } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { presets } from '../../utils';
import { HelpTooltip } from '../../utils/HelpTooltip';
import { Spacer } from '../../utils/Spacer';
import { TextLinkifyLatex } from '../../utils/TextLinkifyLatex';
import getAge from '../../utils/timeUtils';
import { EditHighlight } from './EditHighlight';
import NewReply from './NewReply';
import styles from './PageHighlights.module.scss';
import { Reply } from './Reply';

const ActionButton: React.FC<{ onClick: () => void; icon: string }> = ({ onClick, icon }) => (
  <span className={styles.actionButton} role="button" onClick={onClick}>
    <i className={icon} />
  </span>
);

const CommentActions: React.FC<{
  id: string;
  contentText: string;
  canEdit: boolean;
  onEdit?: () => void;
  onReply: () => void;
}> = ({ canEdit, contentText, id, onEdit, onReply }) => {
  const removeHighlight = usePaperStore(state => state.removeHighlight);
  return (
    <div className={baseStyles.centeredRow}>
      <ActionButton onClick={() => onReply()} icon="fas fa-reply" />
      <div css={{ flexGrow: 1 }} />
      {contentText && (
        <HelpTooltip title="Copy highlighted text">
          <span>
            <ActionButton
              onClick={async () => {
                await copy(contentText);
                toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
              }}
              icon="far fa-copy"
            />
          </span>
        </HelpTooltip>
      )}
      {canEdit && onEdit && <ActionButton icon="fas fa-pencil-alt" onClick={onEdit} />}
      {canEdit && removeHighlight && <ActionButton icon="far fa-trash-alt" onClick={() => removeHighlight(id)} />}
    </div>
  );
};

export interface HighlightContentProps extends T_Highlight {
  onResize?: () => void;
  onAction?: () => void;
  onGoto?: () => void;
}

export const HighlightContent: React.FC<HighlightContentProps> = ({
  highlighted_text: content,
  text: comment,
  username,
  createdAt,
  canEdit,
  id,
  onResize,
  replies,
  onAction,
  onGoto,
}) => {
  const contentText = content || '';
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [showReply, setShowReply] = React.useState(false);
  const { updateHighlight, replyToHighlight } = usePaperStore(
    state => pick(state, ['updateHighlight', 'replyToHighlight']),
    shallow,
  );
  React.useEffect(() => {
    onResize && onResize();
  }, [onResize, isEditOpen, showReply]);

  const submitReply = async (replyText: string) => {
    try {
      await replyToHighlight(id, replyText);
      setShowReply(false);
    } catch (err) {
      console.log(err.response);
    }
  };

  return (
    <div css={presets.col}>
      <React.Fragment>
        {isEditOpen ? (
          <React.Fragment>
            <Spacer size={4} />
            <EditHighlight
              text={comment}
              onSubmit={text => {
                updateHighlight(id, { text, visibility: { type: 'public' } })
                  .then(() => {
                    setIsEditOpen(false);
                  })
                  .catch(err => console.error(err.response));
              }}
              isTextRequired={false}
            />
            <Spacer size={8} />
          </React.Fragment>
        ) : (
          <Typography variant="body1" onClick={() => onGoto?.()}>
            <TextLinkifyLatex text={comment} />
          </Typography>
        )}
      </React.Fragment>
      <Typography variant="body2" color="textSecondary">
        {username}, {getAge(createdAt)}
      </Typography>

      <Spacer size={8} />
      <CommentActions
        {...{ canEdit, id, contentText }}
        onReply={() => {
          setShowReply(true);
          onAction?.();
        }}
        onEdit={() => {
          setIsEditOpen(true);
          onAction?.();
        }}
      />
      {!isEmpty(replies) && (
        <div className={styles.repliesRoot}>
          {replies.map(reply => (
            <Reply key={reply.id} reply={reply} />
          ))}
        </div>
      )}
      {showReply && <NewReply onSubmit={submitReply} />}
    </div>
  );
};
