/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Rnd } from 'react-rnd';
import { T_Highlight, T_LTWH, T_Position } from '../../../models';

interface AreaHighlightProps {
  position: T_Position;
  onChange: (rect: T_LTWH) => void;
  onClick: (event: React.MouseEvent) => void;
  isScrolledTo: boolean;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

const AreaHighlight = React.forwardRef<HTMLDivElement, AreaHighlightProps>(
  ({ position, onChange, onClick, onMouseEnter, isScrolledTo, ...otherProps }, forwardRef) => {
    return (
      <React.Fragment>
        <span ref={forwardRef} style={{ ...position.boundingRect, position: 'absolute', zIndex: -1 }} />
        <Rnd
          css={css`
            border: 1px dashed rgb(156, 156, 156);
            background-color: rgba(252, 232, 151, 1);
            opacity: 1;
            mix-blend-mode: multiply;
            cursor: pointer !important;
          `}
          className="AreaHighlight"
          disableDragging={true}
          onDragStop={(_, data) => {
            const boundingRect = {
              ...position.boundingRect,
              top: data.y,
              left: data.x,
            };
            onChange(boundingRect);
          }}
          enableResizing={undefined}
          onResizeStop={(_, direction, ref, delta, position) => {
            const boundingRect = {
              top: position.y,
              left: position.x,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            };

            onChange(boundingRect);
          }}
          position={{
            x: position.boundingRect.left,
            y: position.boundingRect.top,
          }}
          size={{
            width: position.boundingRect.width,
            height: position.boundingRect.height,
          }}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          {...otherProps}
        />
      </React.Fragment>
    );
  },
);

export default AreaHighlight;
