/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ClickAwayListener, MuiThemeProvider, Popper, PopperProps } from '@material-ui/core';
import React from 'react';
import { theme } from '../themes';

interface PopupProps {
  bodyElement: React.ReactElement;
  popupContent: React.ReactElement;
  onContentChange?: () => void;
}

export const Popup: React.FC<PopupProps> = React.memo(({ bodyElement, popupContent }) => {
  const contentRef = React.useRef<HTMLElement>(null);
  const popperRef: PopperProps['popperRef'] = React.useRef(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const hideOnLeave = React.useRef(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const showPopup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  const hidePopup = () => {
    if (!hideOnLeave.current) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  React.useEffect(() => {
    // Clear timeout on unmount
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      hideOnLeave.current = true;
    }
  }, [isOpen]);

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
        <MuiThemeProvider theme={theme}>
          <ClickAwayListener
            onClickAway={() => {
              // TODO: only close if element not dirty
              setIsOpen(false);
            }}
          >
            <span
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onMouseLeave={() => hideOnLeave.current && hidePopup()}
            >
              {React.cloneElement(popupContent, { onResize: onPopupResize, onHide: hidePopup, hideOnLeave })}
            </span>
          </ClickAwayListener>
        </MuiThemeProvider>
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
