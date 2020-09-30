/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import { isMac } from '../../utils';

const NewReply: React.FC<{ onSubmit: (reply: string) => void }> = ({ onSubmit }) => {
  const [reply, setReply] = React.useState('');
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const submitForm = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (formRef.current?.reportValidity()) {
      onSubmit(reply);
    }
  };

  return (
    <form
      ref={formRef}
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
        required
        onKeyDown={e => {
          if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'Enter') {
            console.log('here');
            submitForm();
          }
        }}
      />
      <Button type="submit" variant="contained" color="primary" size="small">
        Reply
      </Button>
    </form>
  );
};

export default NewReply;
