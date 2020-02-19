/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Popper, PopperProps } from '@material-ui/core';
import { useResizeObserver } from '../utils/hooks';

interface PopupProps {
  bodyElement: React.ReactElement;
  popupContent: React.ReactElement;
  onContentChange?: () => void;
}

export const Popup: React.FC<PopupProps> = React.memo(({ bodyElement, popupContent }) => {
  const contentRef = React.useRef<HTMLElement>(null);
  const popperRef: PopperProps['popperRef'] = React.useRef(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
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

  const onPopupResize = React.useCallback(() => {
    popperRef.current?.update();
  }, []);

  return (
    <React.Fragment>
      {React.cloneElement(bodyElement, {
        onMouseEnter: showPopup,
        onMouseLeave: hidePopup,
        ref: contentRef,
      })}
      <Popper open={isOpen} anchorEl={contentRef.current} placement="top" style={{ zIndex: 10 }} popperRef={popperRef}>
        <span
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={() => hidePopup()}
        >
          {React.cloneElement(popupContent, { onResize: onPopupResize, onHide: hidePopup })}
        </span>
      </Popper>
    </React.Fragment>
  );
});

interface PopupManagerProps {
  clearAnchor: () => void;
  popupContent: React.ReactElement | null;
  anchorEl: HTMLElement | undefined;
}

export const PopupManager: React.FC<PopupManagerProps> = ({ anchorEl, clearAnchor, popupContent }) => {
  const popupTimeoutId = React.useRef<NodeJS.Timeout>();

  const clearHideTimeout = () => {
    if (popupTimeoutId.current) clearTimeout(popupTimeoutId.current);
    popupTimeoutId.current = undefined;
  };

  const closePopover = React.useCallback(() => {
    if (anchorEl) {
      if (popupTimeoutId.current) return;
      popupTimeoutId.current = setTimeout(() => {
        clearAnchor();
      }, 300);
    }
  }, [clearAnchor, anchorEl]);

  const onContentLeave = React.useCallback(() => {
    closePopover();
    if (anchorEl) anchorEl.removeEventListener('mouseleave', onContentLeave);
  }, [closePopover, anchorEl]);

  if (anchorEl) anchorEl.addEventListener('mouseleave', onContentLeave);
  React.useEffect(() => {
    return () => {
      clearHideTimeout();
      if (anchorEl) anchorEl.removeEventListener('mouseleave', onContentLeave);
    };
  }, [anchorEl, onContentLeave]);

  return (
    <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="top" style={{ zIndex: 10 }}>
      {popupContent ? (
        React.cloneElement(popupContent, {
          onMouseEnter: () => {
            if (anchorEl) anchorEl.removeEventListener('mouseleave', onContentLeave);
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
