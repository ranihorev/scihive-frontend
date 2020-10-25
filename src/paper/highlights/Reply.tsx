/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import { ReplyProps } from '../../models';
import { TextLinkifyLatex } from '../../utils/TextLinkifyLatex';
import getAge from '../../utils/timeUtils';
import styles from './PageHighlights.module.scss';

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
