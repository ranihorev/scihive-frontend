/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { CircularProgress } from '@material-ui/core';
import { pick } from 'lodash';
import * as queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../stores/paper';
import { presets } from '../utils';
import { usePaperId } from '../utils/hooks';
import PdfLoader from './Pdf/components/PdfLoader';
import { ReadingProgress } from './ReadingProgress';
import ReferencesProvider from './ReferencesProvider';
import Resizer from './Resizer';
import { Sidebar } from './Sidebar';
import { APP_BAR_HEIGHT } from './TopBar/PrimaryAppBar';

const FETCHING = '-1';
const FAILED = '0';

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('touchmove', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchmove', handleResize);
    };
  }, []);
  return windowDimensions;
};

const Loader = () => (
  <div
    css={css`
      position: absolute;
      top: 50%;
      left: 50%;
    `}
  >
    <CircularProgress />
  </div>
);

const PdfCommenter: React.FC = () => {
  const [url, setUrl] = useState(FETCHING);
  const { height: pageHeight, width: pageWidth } = useWindowDimensions();
  const contentHeight = pageHeight - APP_BAR_HEIGHT;
  const [pdfWidthPrct, setPdfWidthPrct] = useState(isMobile ? 0.25 : 0.75);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile ? true : false);

  const paperId = usePaperId();
  const location = useLocation();
  const { title, clearPaper, fetchPaper, setSidebarTab } = usePaperStore(
    state => pick(state, ['title', 'clearPaper', 'fetchPaper', 'setSidebarTab']),
    shallow,
  );

  useEffect(() => {
    // Fetch paper data
    setUrl(FETCHING);
    clearPaper();
    const selectedGroupId = queryString.parse(location.search).list as string;
    fetchPaper({ paperId, selectedGroupId })
      .then(data => {
        setUrl(data.url);
        // Set sidebar tab to info
        if (queryString.parse(location.search).info) {
          setSidebarTab('Info');
        }
      })
      .catch(e => {
        console.log(e.response);
        setUrl(FAILED);
      });
  }, [paperId]);

  let viewerRender = null;
  if (url === FETCHING) {
    viewerRender = <Loader />;
  } else if (url === FAILED) {
    viewerRender = <div style={{ textAlign: 'center' }}>PDF file does not exist</div>;
  } else {
    viewerRender = (
      <ReferencesProvider>
        <PdfLoader url={url} />
      </ReferencesProvider>
    );
  }
  const sidebarWidth = pageWidth * (1 - pdfWidthPrct);

  const SidebarElement = (
    <Sidebar
      width={sidebarWidth}
      isCollapsed={isSidebarCollapsed}
      onCollapseClick={() => setIsSidebarCollapsed(state => !state)}
    />
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{title || 'SciHive'}</title>
      </Helmet>
      <div
        style={{
          position: 'relative',
          height: contentHeight,
          overflowY: 'hidden',
        }}
      >
        <ReadingProgress />

        <React.Fragment>
          {!isSidebarCollapsed && (
            <Resizer
              key={`${pageWidth}-${pageHeight}`}
              initPos={sidebarWidth}
              onDrag={({ x }) => setPdfWidthPrct((pageWidth - x) / pageWidth)}
              bounds={{ left: 200, right: 600, top: 0, bottom: 0 }}
              isVerticalLine={true}
            />
          )}
          <div
            css={css`
              ${presets.row};
              height: 100%;
            `}
          >
            {SidebarElement}
            <div
              style={{
                width: isSidebarCollapsed ? '100%' : pdfWidthPrct * pageWidth,
              }}
              css={css`
                position: relative;
              `}
            >
              {viewerRender}
            </div>
          </div>
        </React.Fragment>
      </div>
    </React.Fragment>
  );
};

export default PdfCommenter;
