/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Draggable from 'react-draggable';

const baseWrapperCss = css`
  position: absolute;
  z-index: 10;
`;

const verticalLineWrapperCss = css`
  ${baseWrapperCss};
  height: 100%;
`;

const horizontalLineWrapperCss = css`
  ${baseWrapperCss};
  width: 100%;
`;

const baseHandleCss = css`
  background-color: rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease, height 0.3s ease, background-color 0.3s ease;
  background-clip: content-box;
  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const verticalLineHandleCss = css`
  ${baseHandleCss};
  height: 100%;
  width: 1px;
  padding: 0 8px 0 2px;
  cursor: ew-resize;
  &:hover {
    width: 5px;
  }
`;

const horizontalLineHandleCss = css`
  ${baseHandleCss};
  width: 100%;
  height: 3px;
  cursor: ns-resize;
  padding: 0px 0 10px 0;
  margin-top: 3px;
`;

const Resizer = ({ isVerticalLine, initPos, onDrag, bounds, step = 20 }) => {
  return (
    <div
      css={isVerticalLine ? verticalLineWrapperCss : horizontalLineWrapperCss}
    >
      <Draggable
        axis={isVerticalLine ? 'x' : 'y'}
        handle=".handle"
        defaultPosition={
          isVerticalLine ? { x: initPos, y: 0 } : { x: 0, y: initPos }
        }
        position={null}
        grid={[step, step]}
        bounds={bounds}
        scale={1}
        onDrag={(e, data) => {
          onDrag({ x: data.x, y: data.y });
        }}
      >
        <div
          className="handle"
          css={isVerticalLine ? verticalLineHandleCss : horizontalLineHandleCss}
        />
      </Draggable>
    </div>
  );
};

export default Resizer;
