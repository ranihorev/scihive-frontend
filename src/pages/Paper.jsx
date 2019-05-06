import React from 'react';
import PdfCommenter from "../components/PdfCommenter";
import PrimaryAppBar from "../components/TopBar/PrimaryAppBar";
import {PaperDekstopMenu, PaperMobileMenu} from "../components/TopBar/PaperMenuBar";
import GroupsModal from "../components/GroupsModal";
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export default function Paper() {
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (wrapperRef.current) disableBodyScroll(wrapperRef.current, {allowTouchMove: el => {
      console.log(el);
      return true;
      }});
    return () => clearAllBodyScrollLocks();
  }, []);

  return (
    <div ref={wrapperRef}>
      <PrimaryAppBar
        desktopItems={<PaperDekstopMenu/>}
        mobileSubItems={<PaperMobileMenu />}
      />
      <PdfCommenter/>
      <GroupsModal />
    </div>
  )
}


