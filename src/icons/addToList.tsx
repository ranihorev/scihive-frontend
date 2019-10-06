/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { SerializedStyles } from '@emotion/css';
export const AddToListIcon: React.FC<{ style?: SerializedStyles; fill: string }> = ({ style, fill }) => {
  return (
    <svg viewBox="0 0 90 100" x="0px" y="0px" css={style} fill={fill}>
      <g>
        <rect x="20.42" y="24.57" width="23.91" height="4" />
        <rect x="20.42" y="38.57" width="23.91" height="4" />
        <rect x="20.42" y="52.57" width="23.91" height="4" />
        <path d="M73.89,49.72V26.56h0a2,2,0,0,0-.62-1.46L54.78,7.85a2,2,0,0,0-1.36-.52v0H12a2,2,0,0,0-2,2v72a2,2,0,0,0,2,2h38.1A21.87,21.87,0,1,0,73.89,49.72ZM55.41,13.91l11.4,10.64H55.41ZM14,79.31v-68H51.41V26.56a2,2,0,0,0,2,2H69.89V49c-.6,0-1.2-.08-1.8-.08A21.88,21.88,0,0,0,47.92,79.31Zm54,9.38A17.88,17.88,0,1,1,86,70.81,17.9,17.9,0,0,1,68.08,88.69Z" />
        <polygon points="70.08 59.98 66.08 59.98 66.08 68.81 57.25 68.81 57.25 72.81 66.08 72.81 66.08 81.64 70.08 81.64 70.08 72.81 78.92 72.81 78.92 68.81 70.08 68.81 70.08 59.98" />
      </g>
    </svg>
  );
};
