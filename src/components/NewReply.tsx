/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const NewReply: React.FC<{ onSubmit: (reply: string) => void }> = ({ onSubmit }) => {
  const [reply, setReply] = React.useState('');

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reply);
  };

  return (
    <form
      css={css`
        text-align: left;
        margin-bottom: 8px;
      `}
      onSubmit={submitForm}
    >
      <TextField
        name="reply"
        label="Your reply"
        multiline
        margin="dense"
        value={reply}
        onChange={event => setReply(event.target.value)}
        inputRef={inp => inp && setTimeout(() => inp.focus(), 100)}
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary" size="small">
        Reply
      </Button>
    </form>
  );
};

export default NewReply;
