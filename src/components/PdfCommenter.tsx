/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { CircularProgress } from '@material-ui/core';
import { pick } from 'lodash';
import * as queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'react-router-dom';
import useDeepCompareEffect from 'use-deep-compare-effect';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../stores/paper';
import { presets } from '../utils';
import PdfLoader from './Pdf/components/PdfLoader';
import { ReadingProgress } from './ReadingProgress';
import Resizer from './Resizer';
import { CollapseButton, Sidebar } from './Sidebar';
import { APP_BAR_HEIGHT } from './TopBar/PrimaryAppBar';
import ReferencesProvider from './ReferencesProvider';

const FETCHING = '-1';
const FAILED = '0';
const MOBILE_WIDTH = 800;

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
  const [title, setTitle] = useState('SciHive');
  const { height: pageHeight, width: pageWidth } = useWindowDimensions();
  const contentHeight = pageHeight - APP_BAR_HEIGHT;
  const defaultPdfPrct = 0.75;
  const [pdfSectionPrct, setPdfSectionPrct] = useState({
    width: defaultPdfPrct,
    height: defaultPdfPrct,
  });

  const params = useParams<{ PaperId: string }>();
  const location = useLocation();
  const { clearPaper, fetchPaper } = usePaperStore(state => pick(state, ['clearPaper', 'fetchPaper']), shallow);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useDeepCompareEffect(() => {
    // Fetch paper data
    setUrl(FETCHING);
    clearPaper();
    const selectedGroupId = queryString.parse(location.search).list as string;
    fetchPaper({ paperId: params.PaperId, selectedGroupId })
      .then(data => {
        setUrl(data.url);
        if (data.title) setTitle(`SciHive - ${data.title}`);
      })
      .catch(e => {
        console.log(e.response);
        setUrl(FAILED);
      });
  }, [params]);

  // Vertical is for mobile phones
  const isVertical = window.innerWidth < MOBILE_WIDTH;

  let viewerRender = null;
  if (url === FETCHING) {
    viewerRender = <Loader />;
  } else if (url === FAILED) {
    viewerRender = <div style={{ textAlign: 'center' }}>PDF file does not exist</div>;
  } else {
    viewerRender = (
      <ReferencesProvider>
        <PdfLoader isVertical={isVertical} url={url} />
      </ReferencesProvider>
    );
  }

  const sidebarWidth = pageWidth * (1 - pdfSectionPrct.width);
  const sidebarHeight = contentHeight * (1 - pdfSectionPrct.height);

  const onCollapseClick = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    setPdfSectionPrct({
      ...pdfSectionPrct,
      width: newState ? 1 : defaultPdfPrct,
    });
  };

  const SidebarElement = (
    <Sidebar
      height={sidebarHeight}
      width={sidebarWidth}
      isCollapsed={isSidebarCollapsed}
      isVertical={isVertical}
      onCollapseClick={onCollapseClick}
    />
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        style={{
          position: 'relative',
          height: contentHeight,
          overflowY: 'hidden',
        }}
      >
        <ReadingProgress />
        {isVertical ? (
          <React.Fragment>
            <Resizer
              key={`${pageWidth}-${pageHeight}`}
              initPos={contentHeight * pdfSectionPrct.height}
              onDrag={({ y }) => {
                setPdfSectionPrct({
                  ...pdfSectionPrct,
                  height: y / contentHeight,
                });
              }}
              bounds={{
                left: 0,
                right: 0,
                top: 50,
                bottom: contentHeight - 50,
              }}
              step={10}
              isVerticalLine={false}
            />
            <div
              css={css`
                ${presets.col};
                width: 100%;
              `}
            >
              <div
                style={{ height: contentHeight * pdfSectionPrct.height }}
                css={css`
                  position: relative;
                  overflow: hidden;
                  display: flex;
                `}
              >
                {viewerRender}
              </div>
              {SidebarElement}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!isSidebarCollapsed ? (
              <Resizer
                key={`${pageWidth}-${pageHeight}`}
                initPos={sidebarWidth}
                onDrag={({ x }) =>
                  setPdfSectionPrct({
                    ...pdfSectionPrct,
                    width: (pageWidth - x) / pageWidth,
                  })
                }
                bounds={{ left: 200, right: 600, top: 0, bottom: 0 }}
                isVerticalLine={true}
              />
            ) : (
              <div
                css={css`
                  position: absolute;
                  top: 4px;
                  left: 0;
                  z-index: 10;
                `}
              >
                <CollapseButton direction={isSidebarCollapsed ? 'right' : 'left'} onClick={onCollapseClick} />
              </div>
            )}
            <div
              css={css`
                ${presets.row};
                height: 100%;
              `}
            >
              {SidebarElement}
              <div
                style={{ width: pdfSectionPrct.width * pageWidth }}
                css={css`
                  position: relative;
                `}
              >
                {viewerRender}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export default PdfCommenter;
