import React from 'react';
import PdfCommenter from "../components/PdfCommenter";
import PrimaryAppBar from "../components/TopBar/PrimaryAppBar";
import {PaperDekstopMenu, PaperMobileMenu} from "../components/TopBar/PaperMenuBar";
import GroupsModal from "../components/GroupsModal";


export default function Paper() {
    return (
      <React.Fragment>
          <PrimaryAppBar
            desktopItems={<PaperDekstopMenu/>}
            mobileSubItems={<PaperMobileMenu />}
          />
          <PdfCommenter/>
          <GroupsModal />
      </React.Fragment>
    )
}


