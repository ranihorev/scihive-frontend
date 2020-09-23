/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export const Spacer: React.FC<{ size: number; width?: number; height?: number }> = ({ size, width, height }) => (
  <div
    className="spacer"
    css={{ width: width !== undefined ? width : size, height: height !== undefined ? height : size }}
  />
);
