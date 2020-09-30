/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { presets } from '../../utils';

interface Props {
  onSubmit: (text: string) => void;
  text?: string;
  isTextRequired?: boolean;
}

export const EditHighlight: React.FC<Props> = ({ onSubmit, text = '', isTextRequired = true }) => {
  const firstFocus = React.useRef(true);
  const [internalText, setInternalText] = React.useState(text);

  React.useEffect(() => {
    setInternalText(text);
  }, [text]);

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit(internalText);
      }}
    >
      <div>
        <TextField
          type="text"
          name="comment"
          label="Your Comment"
          placeholder="Add a comment (Optional)"
          multiline
          margin="dense"
          variant="outlined"
          value={internalText}
          fullWidth
          required={isTextRequired}
          onChange={event => setInternalText(event.target.value)}
          inputRef={inp => {
            if (inp && firstFocus.current) {
              firstFocus.current = false;
              setTimeout(() => inp.focus(), 100);
            }
          }}
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              onSubmit(internalText);
            }
          }}
          css={{ textarea: { minHeight: 70 }, '.MuiInputBase-marginDense': { padding: '10px 10px' } }}
        />
      </div>
      <div
        css={css`
          ${presets.row};
          font-size: 0.65rem;
          color: grey;
          margin-bottom: 8px;
        `}
      >
        * Type LaTeX formulas using $ signs, e.g. $(3\times 4)$
      </div>
      <div
        css={[
          presets.row,
          {
            width: '100%',
            justifyContent: 'flex-end',
            marginTop: 8,
          },
        ]}
      >
        <Button type="submit" variant="contained" color="primary" size="small">
          Submit
        </Button>
      </div>
    </form>
  );
};
