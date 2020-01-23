/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Card, CardContent, CardMedia, Grid, Tooltip, Typography } from '@material-ui/core';
import { pick } from 'lodash';
import React from 'react';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';
import { VisibilityType, AllHighlight, isDirectHighlight } from '../../../../models';
import { usePaperStore } from '../../../../stores/paper';
import { EditHighlight } from '../../../EditHighlight';
import NewReply from '../../../NewReply';
import { PopoverMenu } from '../../../PopoverMenu';
import Replies from '../../../Replies';
import { TextLinkifyLatex } from '../../../TextLinkifyLatex';
import get_age from '../../../timeUtils';
import { ActionIconButton, actionIconCss } from './ActionButton';
import { Quote } from './Quote';

const visibiltyToIcon: { [key in VisibilityType]: string } = {
  private: 'fas fa-user-shield',
  public: 'fas fa-globe',
  anonymous: 'fas fa-globe',
  group: 'fas fa-users',
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface CommentProps {
  isFocused: boolean;
  highlight: AllHighlight;
}

export const SidebarHighlightItem = React.forwardRef<HTMLDivElement, CommentProps>(({ isFocused, highlight }, ref) => {
  const content = isDirectHighlight(highlight) ? highlight.content : {};
  const [isHover, setIsHover] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [showReply, setShowReply] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const history = useHistory();

  const { setPaperJumpTo, updateHighlight, replyToHighlight, removeHighlight } = usePaperStore(
    state => pick(state, ['setPaperJumpTo', 'updateHighlight', 'replyToHighlight', 'removeHighlight']),
    shallow,
  );

  const submitReply = (replyText: string) => {
    replyToHighlight(highlight.id, replyText)
      .then(() => {
        setShowReply(false);
      })
      .catch(err => console.log(err.response));
  };

  if (!content) {
    return null;
  }

  const hasCommentText = Boolean(highlight.comment.text);

  return (
    <div
      css={css`
        width: 100%;
        .katex {
          font-size: 0.85rem;
        }
      `}
      ref={ref}
    >
      <Card
        style={{ backgroundColor: isFocused ? '#e0e9ff' : '#f9f9f9' }}
        css={{
          transition: '0.8s background-color',
          margin: '5px 8px',
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.12)',
          cursor: isDirectHighlight(highlight) ? 'pointer' : undefined,
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={e => {
          if (isDirectHighlight(highlight) && !actionsRef.current?.contains(e.target as Node)) {
            setPaperJumpTo({ area: 'paper', type: 'highlight', id: highlight.id, location: highlight.position });
            history.push({ hash: `highlight-${highlight.id}` });
          }
        }}
      >
        <CardContent
          css={css`
            padding: 10px 10px 3px !important;
          `}
          ref={contentRef}
        >
          <PopoverMenu
            anchorEl={contentRef.current}
            onClose={() => setEditMode(false)}
            open={editMode}
            zIndex={9999}
            placement="bottom"
          >
            <EditHighlight
              text={highlight.comment.text}
              onSubmit={data => {
                updateHighlight(highlight.id, data)
                  .then(() => {
                    setEditMode(false);
                  })
                  .catch(err => console.log(err.response));
              }}
              visibilitySettings={highlight.visibility}
              isTextRequired={false}
            />
          </PopoverMenu>
          <div>
            {content.image && (
              <CardMedia
                css={css`
                  height: 0;
                  padding-top: 56.25%;
                  border-bottom: solid 1px #bdbdbd;
                `}
                image={content.image}
                title="screenshot"
              />
            )}
            {content.text && !hasCommentText && <Quote text={content.text} />}
          </div>

          <Typography
            component="div"
            css={css`
              font-size: 0.8rem;
            `}
          >
            <TextLinkifyLatex text={highlight.comment.text} />
          </Typography>

          <React.Fragment>
            <div
              css={css`
                margin-top: 5px;
                font-size: 0.75rem;
              `}
            >
              <div>
                <b>{highlight.user || 'Anonymous'}</b>, <small>{get_age(highlight.createdAt)}</small>
              </div>
            </div>
            <Grid
              container
              alignItems="center"
              css={css`
                margin-top: 2px;
                text-align: center;
                display: flex;
                button {
                  font-size: 14px;
                }
                margin-left: -5px;
              `}
              ref={actionsRef}
            >
              <div>
                <ActionIconButton onClick={() => setShowReply(!showReply)} name="fas fa-reply" />
              </div>
              {highlight.canEdit && isHover ? (
                <div>
                  <ActionIconButton onClick={() => setEditMode(!editMode)} name="fas fa-pencil-alt" />
                  <ActionIconButton onClick={() => removeHighlight(highlight.id)} name="far fa-trash-alt" />
                </div>
              ) : (
                ''
              )}
              {highlight.canEdit && (
                <div
                  css={css`
                    margin-left: auto;
                    font-size: 13px;
                  `}
                >
                  <Tooltip title={capitalize(highlight.visibility.type)} placement="top">
                    <i className={visibiltyToIcon[highlight.visibility.type]} css={actionIconCss} />
                  </Tooltip>
                </div>
              )}
            </Grid>
          </React.Fragment>
          {highlight.replies && <Replies replies={highlight.replies} />}
          {showReply && <NewReply onSubmit={submitReply} />}
        </CardContent>
      </Card>
    </div>
  );
});
