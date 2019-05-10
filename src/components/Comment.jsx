// @flow

import React, { useState } from "react";

import type { T_Highlight } from "../../src/types";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import './Comment.scss';
import get_age from "./timeUtils";
import {IconButton} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import axios from "axios";
import {withRouter} from "react-router";
import NewReply from "./NewReply";
import Replies from "./Replies";
import Grid from "@material-ui/core/Grid";
import Linkify from 'react-linkify';
import Tooltip from "@material-ui/core/Tooltip";


type Props = {
  highlight: T_Highlight,
  removeHighlight: () => void,
  updateHighlight: () => void,
  setRef: () => void,
  isFocused: boolean,
};

const truncateURL = url => {
  return url.replace(/^https?:\/\//,'').substring(0, 20) + '...'
};

const visibiltyToIcon = {
  private: 'fas fa-user-shield',
  public: 'fas fa-globe',
  anonymous: 'fas fa-globe',
  group: 'fas fa-users',
};

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

function Comment({isFocused, highlight, removeHighlight, updateHighlight, setRef, match: {params}}: Props) {

  const {image, text} = highlight.content;
  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState(highlight.comment.text);
  const [showReply, setShowReply] = useState(false);

  const updateHash = () => {
    window.location.hash = `highlight-${highlight.id}`;
  };

  const updateComment = (e) => {
    e.preventDefault();
    axios.patch(`/paper/${params.PaperId}/comment/${highlight.id}`, {comment: commentText})
      .then(res => {
        updateHighlight(res.data.comment);
        setEditMode(false);
      })
      .catch(err => console.log(err.response));
  };

  const submitReply = (text) => {
    axios.post(`/paper/${params.PaperId}/comment/${highlight.id}/reply`, {text})
      .then(res => {
        setShowReply(false);
        updateHighlight(res.data.comment);
      })
      .catch(err => console.log(err.response))
  };

  const visibility = <Tooltip title={capitalize(highlight.visibility)} placement="top">
    <i className={visibiltyToIcon[highlight.visibility]} />
  </Tooltip>;

  let actions = (
    <Grid container alignItems={'center'} className={"actions"}>
      {highlight.canEdit ?
        <div>
          <IconButton onClick={() => removeHighlight(highlight.id)}>
            <i className="far fa-trash-alt"></i>
          </IconButton>
          <IconButton onClick={() => setEditMode(!editMode)}>
            <i className="fas fa-pencil-alt"></i>
          </IconButton>
        </div> : ''
      }
      <div>
        <IconButton onClick={() => setShowReply(!showReply)}>
          <i className="fas fa-reply"></i>
        </IconButton>
      </div>
      {highlight.canEdit ?
        <div className={'visibility'}>
          {visibility}
        </div> : null
      }
    </Grid>
  );

  const imageDom = image ? <CardMedia className={'media'} image={image} title="screenshot"/> : "";
  const textMaxLen = 50;
  const textDom = text ?
    <blockquote> {text.slice(0, textMaxLen)}{text.length > textMaxLen ? '...' : ''} </blockquote>
    : '';

  return (
    <div className={'comment-wrapper'} ref={setRef}>
      <Card className={`comment ${isFocused ? 'comment-focused' : ''}`}>
        <div onClick={updateHash} className='clickable'>
          {imageDom}
          {textDom}
        </div>
        <CardContent className="content">
          <div color="textSecondary" className="meta">
            <div>
              {highlight.user || 'Anonymous'}, {get_age(highlight.createdAt)}
            </div>
          </div>
          {editMode ?
            <form onSubmit={updateComment}>
              <TextField
                name="comment" label="Your Comment" multiline margin="normal" variant="outlined" value={commentText}
                onChange={event => setCommentText(event.target.value)}
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
            :
            <Typography component="p" onClick={updateHash} className='clickable'>
              <Linkify properties={{target: '_blank'}} textDecorator={truncateURL}>{highlight.comment.text}</Linkify>
            </Typography>
          }
          {/*Page {highlight.position.pageNumber}*/}


          {actions}
          { highlight.replies ?
            <Replies replies={highlight.replies}/> : ''
          }
          {showReply ? <NewReply onSubmit={submitReply}/> : ''}
        </CardContent>
      </Card>
    </div>

  );
}

export default withRouter(Comment);
