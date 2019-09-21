/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import useReactRouter from 'use-react-router';
import { T_Highlight, VisibilityType } from '../models';
import NewReply from './NewReply';
import Replies from './Replies';
import { TextLinkifyLatex } from './TextLinkifyLatex';
import get_age from './timeUtils';

const visibiltyToIcon: { [key in VisibilityType]: string } = {
  private: 'fas fa-user-shield',
  public: 'fas fa-globe',
  anonymous: 'fas fa-globe',
  group: 'fas fa-users',
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface CommentProps {
  isFocused: boolean;
  highlight: T_Highlight;
  removeHighlight: (id: string) => void;
  updateHighlight: (highlight: T_Highlight) => void;
  jumpToHighlight: () => void;
}

const SidebarHighlightItem = React.forwardRef<HTMLDivElement, CommentProps>(
  ({ isFocused, highlight, removeHighlight, updateHighlight, jumpToHighlight }, ref) => {
    const { image, text } = highlight.content;
    const [editMode, setEditMode] = React.useState(false);
    const [commentText, setCommentText] = React.useState(highlight.comment.text);
    const [showReply, setShowReply] = React.useState(false);
    const {
      history,
      match: { params },
    } = useReactRouter();

    const updateJumpTo = () => {
      jumpToHighlight();
      history.push({ hash: `highlight-${highlight.id}` });
    };

    const updateComment = (e: React.FormEvent) => {
      e.preventDefault();
      axios
        .patch(`/paper/${params.PaperId}/comment/${highlight.id}`, {
          comment: commentText,
        })
        .then(res => {
          updateHighlight(res.data.comment);
          setEditMode(false);
        })
        .catch(err => console.log(err.response));
    };

    const submitReply = (replyText: string) => {
      axios
        .post(`/paper/${params.PaperId}/comment/${highlight.id}/reply`, {
          text: replyText,
        })
        .then(res => {
          setShowReply(false);
          updateHighlight(res.data.comment);
        })
        .catch(err => console.log(err.response));
    };

    const visibility = (
      <Tooltip title={capitalize(highlight.visibility.type)} placement="top">
        <i className={visibiltyToIcon[highlight.visibility.type]} />
      </Tooltip>
    );

    const actions = (
      <Grid
        container
        alignItems="center"
        css={css`
          margin-top: 5px;
          text-align: center;
          display: flex;
          button {
            font-size: 14px;
          }
        `}
      >
        <div>
          <IconButton onClick={() => setShowReply(!showReply)}>
            <i className="fas fa-reply" />
          </IconButton>
        </div>
        {highlight.canEdit ? (
          <div>
            <IconButton onClick={() => setEditMode(!editMode)}>
              <i className="fas fa-pencil-alt" />
            </IconButton>
            <IconButton onClick={() => removeHighlight(highlight.id)}>
              <i className="far fa-trash-alt" />
            </IconButton>
          </div>
        ) : (
          ''
        )}
        {highlight.canEdit ? (
          <div
            css={css`
              margin-left: auto;
              font-size: 13px;
            `}
          >
            {visibility}
          </div>
        ) : null}
      </Grid>
    );

    const imageDom = image ? (
      <CardMedia
        css={css`
          height: 0;
          padding-top: 56.25%;
          border-bottom: solid 1px #bdbdbd;
        `}
        image={image}
        title="screenshot"
      />
    ) : (
      ''
    );
    const textMaxLen = 50;
    const textDom = text && (
      <blockquote
        css={css`
          font-size: 0.7rem;
          padding: 6px 6px 4px 6px;
          margin: 0;
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
    );

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
          style={isFocused ? { backgroundColor: '#dde7ff' } : {}}
          css={css`
            transition: 0.8s background-color;
            margin: 5px 8px;
          `}
        >
          <div
            onClick={updateJumpTo}
            css={css`
              cursor: pointer;
            `}
          >
            {imageDom}
            {textDom}
          </div>
          <CardContent
            css={css`
              padding: 10px !important;
            `}
          >
            {editMode ? (
              <form onSubmit={updateComment}>
                <TextField
                  name="comment"
                  label="Your Comment"
                  multiline
                  margin="normal"
                  variant="outlined"
                  value={commentText}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setEditMode(false);
                  }}
                  onChange={event => setCommentText(event.target.value)}
                  style={{ width: '100%' }}
                  inputRef={inp => {
                    if (inp) {
                      setTimeout(() => inp.focus(), 100);
                    }
                  }}
                />
                <Button type="submit" variant="contained" color="primary" size="small">
                  Save
                </Button>
              </form>
            ) : (
              <Typography
                component="div"
                onClick={updateJumpTo}
                css={css`
                  cursor: pointer;
                `}
              >
                <TextLinkifyLatex text={highlight.comment.text} />
              </Typography>
            )}
            <div
              color="textSecondary"
              css={css`
                margin-top: 5px;
                font-size: 0.8rem;
              `}
            >
              <div>
                {highlight.user || 'Anonymous'}, {get_age(highlight.createdAt)}
              </div>
            </div>
            {actions}
            {highlight.replies && <Replies replies={highlight.replies} />}
            {showReply && <NewReply onSubmit={submitReply} />}
          </CardContent>
        </Card>
      </div>
    );
  },
);

export default SidebarHighlightItem;
