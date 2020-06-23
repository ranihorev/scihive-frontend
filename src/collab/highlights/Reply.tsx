/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { TextLinkifyLatex } from '../../components/TextLinkifyLatex';
import { ReplyProps } from '../../models';

export const Reply: React.FC<{ reply: ReplyProps }> = ({ reply }) => {
  return (
    <div
      css={css`
        padding-top: 5px;
        font-size: 0.8rem;
        .katex {
          font-size: 0.75rem;
        }
      `}
    >
      <b>{reply.user}</b> <TextLinkifyLatex text={reply.text} />
    </div>
  );
};
