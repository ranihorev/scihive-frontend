import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';
import React from 'react';
import PdfCommenter from '../components/PdfCommenter';
import { PaperDekstopMenu, PaperMobileMenu } from '../components/TopBar/PaperMenuBar';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

export default function Paper() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (wrapperRef.current)
      disableBodyScroll(wrapperRef.current, {
        allowTouchMove: () => {
          return true;
        },
      });
    return () => clearAllBodyScrollLocks();
  }, []);

  return (
    <React.Fragment>
      <div ref={wrapperRef}>
        <PrimaryAppBar desktopItems={<PaperDekstopMenu />} mobileSubItems={PaperMobileMenu()} />
        <PdfCommenter />
      </div>
    </React.Fragment>
  );
}
