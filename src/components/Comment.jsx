/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import get_age from './timeUtils';
import { IconButton } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { withRouter } from 'react-router';
import NewReply from './NewReply';
import Replies from './Replies';
import Grid from '@material-ui/core/Grid';
import Linkify from 'react-linkify';
import Tooltip from '@material-ui/core/Tooltip';

const truncateURL = url => {
  return url.replace(/^https?:\/\//, '').substring(0, 20) + '...';
};

const visibiltyToIcon = {
  private: 'fas fa-user-shield',
  public: 'fas fa-globe',
  anonymous: 'fas fa-globe',
  group: 'fas fa-users'
};

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

function Comment({
  isFocused,
  highlight,
  removeHighlight,
  updateHighlight,
  setRef,
  match: { params }
}) {
  const { image, text } = highlight.content;
  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState(highlight.comment.text);
  const [showReply, setShowReply] = useState(false);

  const updateHash = () => {
    window.location.hash = `highlight-${highlight.id}`;
  };

  const updateComment = e => {
    e.preventDefault();
    axios
      .patch(`/paper/${params.PaperId}/comment/${highlight.id}`, {
        comment: commentText
      })
      .then(res => {
        updateHighlight(res.data.comment);
        setEditMode(false);
      })
      .catch(err => console.log(err.response));
  };

  const submitReply = text => {
    axios
      .post(`/paper/${params.PaperId}/comment/${highlight.id}/reply`, { text })
      .then(res => {
        setShowReply(false);
        updateHighlight(res.data.comment);
      })
      .catch(err => console.log(err.response));
  };

  const visibility = (
    <Tooltip title={capitalize(highlight.visibility)} placement="top">
      <i className={visibiltyToIcon[highlight.visibility]} />
    </Tooltip>
  );

  let actions = (
    <Grid
      container
      alignItems={'center'}
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
  const textDom = text ? (
    <blockquote
      css={css`
        font-size: 0.7rem;
        padding: 6px 6px 4px 6px;
        margin: 0;
        font-style: italic;
        quotes: "\\201C""\\201D";
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
  ) : (
    ''
  );

  return (
    <div
      css={css`
        width: 100%;
      `}
      ref={setRef}
    >
      <Card
        style={isFocused ? { backgroundColor: '#dde7ff' } : {}}
        css={css`
          transition: 0.8s background-color;
          margin: 5px 8px;
        `}
      >
        <div
          onClick={updateHash}
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
                onChange={event => setCommentText(event.target.value)}
                inputRef={inp => {
                  if (inp) {
                    setTimeout(() => inp.focus(), 100);
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
              >
                Save
              </Button>
            </form>
          ) : (
            <Typography
              component="p"
              onClick={updateHash}
              css={css`
                cursor: pointer;
              `}
            >
              <Linkify
                properties={{ target: '_blank' }}
                textDecorator={truncateURL}
              >
                {highlight.comment.text}
              </Linkify>
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
          {highlight.replies ? <Replies replies={highlight.replies} /> : ''}
          {showReply ? <NewReply onSubmit={submitReply} /> : ''}
        </CardContent>
      </Card>
    </div>
  );
}

export default withRouter(Comment);
