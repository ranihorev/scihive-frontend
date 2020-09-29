/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { TextLinkifyLatex } from '../../components/TextLinkifyLatex';
import { ReplyProps } from '../../models';
import { Typography } from '@material-ui/core';
import styles from './PageHighlights.module.scss';
import getAge from '../../components/timeUtils';

export const Reply: React.FC<{ reply: ReplyProps }> = ({ reply }) => {
  return (
    <div className={styles.reply}>
      <Typography variant="body2">
        <TextLinkifyLatex text={reply.text} />
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {reply.user}, {getAge(reply.createdAt)}
      </Typography>
    </div>
  );
};
