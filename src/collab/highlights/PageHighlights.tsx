/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import copy from 'clipboard-copy';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import NewReply from '../../components/NewReply';
import { Popup } from '../../components/Popup';
import { TextLinkifyLatex } from '../../components/TextLinkifyLatex';
import get_age from '../../components/timeUtils';
import {
  isValidHighlight,
  PaperJump,
  TempHighlight,
  T_ExtendedHighlight,
  T_Highlight,
  T_Position,
  T_ScaledPosition,
} from '../../models';
import { usePaperStore } from '../../stores/paper';
import { presets } from '../../utils';
import { Spacer } from '../utils/Spacer';
import { EditHighlight } from './EditHighlight';
import styles from './PageHighlights.module.scss';
import { Reply } from './Reply';
import TextHighlight from './TextHighlight';

const ActionButton: React.FC<{ onClick: () => void; icon: string }> = ({ onClick, icon }) => (
  <span
    css={css`
      cursor: pointer;
      padding: 3px;
      &:not(:first-of-type) {
        margin-left: 5px;
      }
      &:hover {
        color: ${presets.themePalette.primary.main};
      }
    `}
    role="button"
    onClick={onClick}
  >
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
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <ActionButton onClick={() => onReply()} icon="fas fa-reply" />
      <div css={{ flexGrow: 1 }} />
      {contentText && (
        <ActionButton
          onClick={async () => {
            await copy(contentText);
            toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
          }}
          icon="far fa-copy"
        />
      )}
      {canEdit && onEdit && <ActionButton icon="fas fa-pencil-alt" onClick={onEdit} />}
      {canEdit && removeHighlight && <ActionButton icon="far fa-trash-alt" onClick={() => removeHighlight(id)} />}
    </div>
  );
};

interface ExpandedHighlightProps extends T_Highlight {
  onResize?: () => void;
  onHide?: () => void;
  hideOnLeave?: React.MutableRefObject<boolean>;
}

const ExpandedHighlight: React.FC<ExpandedHighlightProps> = ({
  highlighted_text: content,
  text: comment,
  username,
  createdAt,
  canEdit,
  id,
  onResize,
  onHide,
  hideOnLeave,
  replies,
}) => {
  const contentText = content || '';
  const wrapperRef = React.useRef<HTMLDivElement>(null);
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

  const hasComment = Boolean(comment);
  return (
    <Paper className={baseStyles.popup} style={{ minWidth: hasComment ? 200 : undefined }} ref={wrapperRef}>
      <div css={presets.col}>
        <span>
          <span className={styles.username}>{username}</span>, <span className={styles.date}>{get_age(createdAt)}</span>
        </span>
        {hasComment && <Spacer size={4} />}
        {hasComment &&
          (isEditOpen ? (
            <EditHighlight
              text={comment}
              onSubmit={text => {
                updateHighlight(id, { text, visibility: { type: 'public' } })
                  .then(() => {
                    onHide && onHide();
                  })
                  .catch(err => console.error(err.response));
              }}
              isTextRequired={false}
            />
          ) : (
            <div>
              <TextLinkifyLatex text={comment} />
            </div>
          ))}
        <Spacer size={4} />
        <CommentActions
          {...{ canEdit, id, contentText }}
          onReply={() => {
            setShowReply(true);
            if (hideOnLeave) {
              hideOnLeave.current = false;
            }
          }}
          onEdit={() => {
            setIsEditOpen(true);
            if (hideOnLeave) {
              hideOnLeave.current = false;
            }
          }}
        />
        {!isEmpty(replies) && (
          <div
            css={css`
              border-top: 1px solid #cfcfcf;
              margin-bottom: 4px;
            `}
          >
            {replies.map(reply => (
              <Reply key={reply.id} reply={reply} />
            ))}
          </div>
        )}
        {showReply && <NewReply onSubmit={submitReply} />}
      </div>
    </Paper>
  );
};

interface SingleHighlight {
  highlight: T_Highlight | TempHighlight;
  viewportPosition: T_Position;
  isScrolledTo: boolean;
  onHighlightClick?: (id: string) => void;
}

const SingleHighlight: React.FC<SingleHighlight> = React.memo(
  ({ highlight, isScrolledTo, viewportPosition, onHighlightClick }) => {
    const component = (
      <TextHighlight
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onClick={() => {
          if (!isValidHighlight(highlight)) return;
          onHighlightClick?.(highlight.id);
        }}
      />
    );
    if (isValidHighlight(highlight)) {
      return <Popup popupContent={<ExpandedHighlight {...highlight} />} bodyElement={component} />;
    }
    return component;
  },
);

interface AllHighlights {
  highlights: T_ExtendedHighlight[];
  onHighlightClick?: (id: string) => void;
  scaledPositionToViewport: (position: T_ScaledPosition) => T_Position;
  jumpData?: PaperJump;
}

export const PageHighlights: React.FC<AllHighlights> = ({
  highlights,
  onHighlightClick,
  scaledPositionToViewport,
  jumpData,
}) => {
  return (
    <div
      className="my-highlight"
      css={css`
        position: absolute;
        left: 0;
        top: 0;
      `}
    >
      {highlights.map((highlight, index) => {
        const viewportPosition = scaledPositionToViewport(highlight.position);
        const isScrolledTo = Boolean(
          isValidHighlight(highlight) && jumpData && jumpData.type === 'highlight' && jumpData.id === highlight.id,
        );

        const id = isValidHighlight(highlight) ? highlight.id : `temp-${index}`;
        return <SingleHighlight key={id} {...{ highlight, onHighlightClick, viewportPosition, isScrolledTo }} />;
      })}
    </div>
  );
};
