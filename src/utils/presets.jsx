/** @jsx jsx */
import { css } from '@emotion/core';

export const row = css`
  display: flex;
  flex-direction: row;
`;

export const col = css`
  display: flex;
  flex-direction: column;
`;

export const centered = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const simpleLink = css`
  text-transform: none;
  text-decoration: none;
  color: inherit;
  &:focus {
    outline: none;
  }
`;

export const linkButton = css`
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  display: inline;
  margin: 0;
  padding: 0;
  color: inherit;
  font-size: inherit;
  &:hover,
  :focus {
    text-decoration: none;
  }
`;

export const popupCss = css`
  padding: 12px;
  max-width: 300px;
  max-height: 200px;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #3e3e3e;
  p:first-of-type {
    margin-top: 0;
  }
  p:last-of-type {
    margin-bottom: 0;
  }
`;

export const themePalette = {
  primary: {
    main: '#36a0f5',
    contrastText: 'white',
  },
};

const breakpoints = { s: 576, m: 768, lg: 992, xl: 1200 };

export const mqMin = bp => `@media (min-width: ${breakpoints[bp]}px)`;
export const mqMax = bp => `@media (max-width: ${breakpoints[bp]}px)`;
