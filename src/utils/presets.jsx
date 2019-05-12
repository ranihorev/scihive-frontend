/** @jsx jsx */
import { css } from '@emotion/core'

export const row = css`
  display: flex;
  flex-direction: row;
`;

export const simpleLink = css`
  text-transform: none;
  text-decoration: none;
  color: inherit;
  &:focus {
    outline: none;
  }
`;
