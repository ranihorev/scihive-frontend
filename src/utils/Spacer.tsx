/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export const Spacer: React.FC<{ size: number; width?: number; height?: number; grow?: boolean }> = ({
  size,
  width,
  height,
  grow,
}) => (
  <div
    className="spacer"
    style={{
      width: width !== undefined ? width : size,
      height: height !== undefined ? height : size,
      flexGrow: grow ? 1 : 0,
    }}
  />
);
