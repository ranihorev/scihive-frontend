/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';

const Replies = ({ replies }) => {
  return (
    <div
      css={css`
        border-top: 1px solid #cfcfcf;
      `}
    >
      {replies.map((reply, index) => {
        return (
          <div
            key={index}
            css={css`
              padding-top: 5px;
              font-size: 0.8rem;
            `}
          >
            <b>{reply.user}</b> {reply.text}
          </div>
        );
      })}
    </div>
  );
};

export default Replies;
