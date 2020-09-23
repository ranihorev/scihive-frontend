/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/core';
import { Button } from '@material-ui/core';
import React from 'react';

interface Props {
  twtr_score: number;
  iconCss: SerializedStyles;
}

// TODO: remove the button
const TwitterMeta: React.FC<Props> = ({ twtr_score, iconCss }) => {
  return (
    <div>
      <Button
        disabled
        size="small"
        css={css`
          padding: 0 4px;
        `}
      >
        <i className="fab fa-twitter" css={iconCss} /> {twtr_score}
      </Button>
    </div>
  );
};

export default TwitterMeta;
