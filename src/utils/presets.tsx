/** @jsx jsx */
import { css } from '@emotion/core';
import { random } from 'lodash';

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
  padding: 10px;
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.8rem;
  line-height: 1.4;
  border-radius: 8px;
  color: #303030;
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
    contrastText: '#ffffff',
  },
  text: {
    // primary: '#ffffff',
  },
} as const;

const breakpoints = { s: 576, m: 768, lg: 992, xl: 1200 };

export const mqMin = (bp: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[bp]}px)`;
export const mqMax = (bp: keyof typeof breakpoints) => `@media (max-width: ${breakpoints[bp]}px)`;

export const modalCss = css`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 350px;
  max-width: 90vw;
  max-height: 80vh;
  background-color: white;
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
  padding: 32px;
  outline: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const COLORS = {
  grey: 'rgba(0, 0, 0, 0.54)',
};

export const highlightBackgroundColor = {
  normal: 'rgba(255, 226, 143, 0.8)',
  active: '#ff4141',
};

export const GROUP_COLORS = {
  BLUE: '#1C8DF0',
  AQUA: '#7FDBFF',
  TEAL: '#2DBCBC',
  OLIVE: '#309267',
  GREEN: '#2ECC40',
  LIME: '#00F169',
  YELLOW: '#F7D500',
  ORANGE: '#FF851B',
  RED: '#FF4136',
  MAROON: '#dd5b9c',
  FUCHSIA: '#FF4DD7',
  PURPLE: '#B233C5',
  GRAY: '#717171',
  SILVER: '#C8C8C8',
};

export const BASE_GROUP_COLOR: GroupColor = 'SILVER';

export const pickRandomColor = (): GroupColor => {
  const keys = Object.keys(GROUP_COLORS) as GroupColor[];
  const idx = random(0, keys.length - 1);
  return keys[idx];
};

export const getGroupColor = (color: GroupColor | undefined) => {
  const hexColor = GROUP_COLORS[color || BASE_GROUP_COLOR];
  if (hexColor) {
    return hexColor;
  } else {
    return GROUP_COLORS[BASE_GROUP_COLOR];
  }
};

export type GroupColor = keyof typeof GROUP_COLORS;

export const smallIconPadding = 4;
