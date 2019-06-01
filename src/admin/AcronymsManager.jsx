/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { TextField, Button } from '@material-ui/core';
import axios from 'axios';
import { presets } from '../utils';

const textFieldCss = css`
  margin: 10px;
`;

const EMPTY_STATE = { shortForm: '', longForm: '' };

export const AddAcronym = () => {
  const [values, setValues] = React.useState(EMPTY_STATE);
  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    axios
      .post(`/admin/new_acronym`, values)
      .then(() => {
        setValues(EMPTY_STATE);
      })
      .catch(err => console.log(err.response));
  };

  return (
    <div
      css={css`
        margin-top: 20px;
      `}
    >
      <form noValidate autoComplete="off" onSubmit={onSubmit}>
        <TextField
          label="Short form"
          name="shortForm"
          value={values.shortForm}
          onChange={handleChange}
          margin="normal"
          css={textFieldCss}
          required
        />
        <TextField
          label="Long form"
          name="longForm"
          value={values.longForm}
          onChange={handleChange}
          margin="normal"
          css={textFieldCss}
          required
        />
        <div
          css={css`
            ${presets.row};
            justify-content: center;
            margin-top: 10px;
          `}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={!values.shortForm || !values.longForm}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};
