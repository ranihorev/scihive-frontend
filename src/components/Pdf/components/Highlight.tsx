import React from 'react';
import { T_Position } from '../../../models';
import '../style/Highlight.css';

interface HighlightProps {
  position: T_Position;
  onClick: () => void;
  isScrolledTo: boolean;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

const Highlight = React.forwardRef<HTMLDivElement, HighlightProps>(
  ({ position, onClick, onMouseEnter, onMouseLeave, isScrolledTo }, ref) => {
    const { rects } = position;
    const left = Math.min(...rects.map(rect => rect.left));
    const right = Math.max(...rects.map(rect => rect.left + rect.width));
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.top + rect.height));
    return (
      <React.Fragment>
        <div
          ref={ref}
          style={{ left, top, width: right - left, height: bottom - top, position: 'absolute', zIndex: -1 }}
        />
        <div className={`Highlight ${isScrolledTo ? 'Highlight--scrolledTo' : ''}`}>
          {rects.map((rect, index) => (
            <div
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onClick={onClick}
              key={index}
              style={rect}
              className="Highlight__part"
            />
          ))}
        </div>
      </React.Fragment>
    );
  },
);

export default Highlight;
