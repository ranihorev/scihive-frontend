/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { CircularProgress } from '@material-ui/core';
import { pick } from 'lodash';
import * as queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../stores/paper';
import { presets } from '../utils';
import { usePaperId } from '../utils/hooks';
import { PdfLoader } from '../components/Pdf';
import { ReadingProgress } from '../components/ReadingProgress';
import { Invite } from './Invite';

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

export const CollaboratedPdf: React.FC<{ showInviteOnLoad: boolean }> = ({ showInviteOnLoad }) => {
  const [isInviteOpen, setIsInviteOpen] = useState(showInviteOnLoad);
  const [url, setUrl] = useState(FETCHING);
  const { height: pageHeight } = useWindowDimensions();
  const contentHeight = pageHeight;

  const paperId = usePaperId();
  const location = useLocation();
  const { title, clearPaper, fetchPaper } = usePaperStore(
    state => pick(state, ['title', 'clearPaper', 'fetchPaper']),
    shallow,
  );

  React.useEffect(() => {
    // Fetch paper data
    setUrl(FETCHING);
    clearPaper();
    const selectedGroupId = queryString.parse(location.search).list as string;
    fetchPaper({ paperId, selectedGroupId, hash: location.hash })
      .then(data => {
        setUrl(data.url);
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
    viewerRender = <PdfLoader url={url} />;
  }

  return (
    <React.Fragment>
      <Helmet>
        <title>{title || 'SciHive'}</title>
      </Helmet>
      <Invite isOpen={isInviteOpen} setIsOpen={setIsInviteOpen} />
      <div
        style={{
          position: 'relative',
          height: contentHeight,
          overflowY: 'hidden',
        }}
      >
        <ReadingProgress />

        <React.Fragment>
          <div
            css={css`
              ${presets.row};
              height: 100%;
            `}
          >
            <div
              style={{
                width: '100%',
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
