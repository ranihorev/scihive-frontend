/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { T_Highlight } from '../../models';

interface Props {
  onUpdate: (e: React.FormEvent, newText: string) => void;
  highlight: T_Highlight;
  onCancel: () => void;
}

export const EditComment: React.FC<Props> = ({ onUpdate, highlight, onCancel }) => {
  const [commentText, setCommentText] = React.useState(highlight.comment.text);

  return (
    <form onSubmit={e => onUpdate(e, commentText)}>
      <TextField
        name="comment"
        label="Your Comment"
        multiline
        margin="dense"
        variant="outlined"
        value={commentText}
        onKeyDown={e => {
          if (e.key === 'Escape') onCancel();
        }}
        onChange={event => setCommentText(event.target.value)}
        style={{ width: '100%' }}
        inputRef={inp => {
          if (inp) {
            setTimeout(() => inp.focus(), 100);
          }
        }}
        css={{
          '.MuiInputBase-multiline': {
            padding: '9px 6px 7px',
          },
        }}
        inputProps={{ style: { fontSize: 14 } }}
      />
      <Button type="submit" variant="contained" color="primary" size="small">
        Save
      </Button>
    </form>
  );
};
