/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Popper, Paper } from '@material-ui/core';
import { popupCss } from '../../../utils/presets';

const Popup = ({ children, popupContent }) => {
  const contentRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const hidePopup = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  React.useEffect(() => {
    // Clear timeout on unmount
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);
  return (
    <React.Fragment>
      <span ref={contentRef} onMouseEnter={() => setIsOpen(true)} onMouseLeave={hidePopup}>
        {children}
      </span>
      <Popper open={isOpen} anchorEl={contentRef.current} placement="top" style={{ zIndex: 10 }}>
        <Paper css={popupCss}>
          <div
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={hidePopup}
          >
            {popupContent}
          </div>
        </Paper>
      </Popper>
    </React.Fragment>
  );
};

export default Popup;
