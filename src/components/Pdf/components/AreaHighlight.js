/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';

// $FlowFixMe
import { Rnd } from 'react-rnd';

const AreaHighlight = React.forwardRef(({ highlight, onChange, onClick, onMouseEnter, ...otherProps }, forwardRef) => {
  return (
    <React.Fragment>
      <span ref={forwardRef} style={{ ...highlight.position.boundingRect, position: 'absolute', zIndex: -1 }} />
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
            ...highlight.position.boundingRect,
            top: data.y,
            left: data.x,
          };
          onChange(boundingRect);
        }}
        enableResizing={false}
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
          x: highlight.position.boundingRect.left,
          y: highlight.position.boundingRect.top,
        }}
        size={{
          width: highlight.position.boundingRect.width,
          height: highlight.position.boundingRect.height,
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        {...otherProps}
      />
    </React.Fragment>
  );
});

export default AreaHighlight;
