/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Popper } from '@material-ui/core';

export const Popup = ({ bodyElement, popupContent }) => {
  const contentRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const showPopup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  const hidePopup = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  React.useEffect(() => {
    // Clear timeout on unmount
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return (
    <React.Fragment>
      {React.cloneElement(bodyElement, {
        onMouseEnter: showPopup,
        onMouseLeave: hidePopup,
        ref: contentRef,
      })}
      <Popper open={isOpen} anchorEl={contentRef.current} placement="top" style={{ zIndex: 10 }}>
        <span
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={() => hidePopup()}
        >
          {popupContent}
        </span>
      </Popper>
    </React.Fragment>
  );
};

export const PopupManager = ({ anchorEl, clearAnchor, popupContent }) => {
  const popupTimeoutId = React.useRef(null);

  const clearHideTimeout = () => {
    clearTimeout(popupTimeoutId.current);
    popupTimeoutId.current = undefined;
  };

  const closePopover = () => {
    if (anchorEl) {
      if (popupTimeoutId.current) return;
      popupTimeoutId.current = setTimeout(() => {
        clearAnchor();
      }, 300);
    }
  };

  const onContentLeave = () => {
    closePopover();
    anchorEl.removeEventListener('mouseleave', onContentLeave);
  };

  if (anchorEl) {
    anchorEl.addEventListener('mouseleave', onContentLeave);
  }
  React.useEffect(() => {
    return () => {
      clearHideTimeout();
      if (anchorEl) anchorEl.removeEventListener('mouseleave', onContentLeave);
    };
  }, [anchorEl]);

  return (
    <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="top" style={{ zIndex: 10 }}>
      {popupContent ? (
        React.cloneElement(popupContent, {
          onMouseEnter: () => {
            anchorEl.removeEventListener('mouseleave', onContentLeave);
            clearHideTimeout();
          },
          onMouseLeave: () => closePopover(),
        })
      ) : (
        <span />
      )}
    </Popper>
  );
};
