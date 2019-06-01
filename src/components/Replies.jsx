/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import * as Latex from 'react-latex';

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
              .katex {
                font-size: 0.75rem;
              }
            `}
          >
            <b>{reply.user}</b> <Latex>{reply.text}</Latex>
          </div>
        );
      })}
    </div>
  );
};

export default Replies;
