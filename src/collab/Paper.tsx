/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styles from './Paper.module.css';
import { CircularProgress } from '@material-ui/core';
import { pick } from 'lodash';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import * as queryString from 'query-string';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import PdfAnnotator from './PdfAnnotator';
import { ReadingProgress } from '../components/ReadingProgress';
import { extractSections } from '../components/Sidebar/PaperSections';
import { usePaperStore } from '../stores/paper';
import { usePaperId } from '../utils/hooks';
import { Invite } from './Invite';

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

type LoadStatus = 'FetchingURL' | 'UrlNotFound' | 'DownloadingPdf' | 'Ready' | 'PdfError';

const useLoadPaper = (paperId: string) => {
  const [status, setStatus] = React.useState<LoadStatus>('FetchingURL');
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(null);
  const location = useLocation();
  const { clearPaper, fetchPaper, setSections } = usePaperStore(
    state => pick(state, ['clearPaper', 'fetchPaper', 'setSections']),
    shallow,
  );

  React.useEffect(() => {
    (async () => {
      setStatus('FetchingURL');
      setPdfDocument(null);
      clearPaper();
      const selectedGroupId = queryString.parse(location.search).list as string;
      let url = '';
      try {
        const urlData = await fetchPaper({ paperId, selectedGroupId, hash: location.hash, isCollab: true });
        url = urlData.url;
      } catch (e) {
        console.error(e.response);
        setStatus('UrlNotFound');
        return;
      }
      setStatus('DownloadingPdf');
      const doc = getDocument(url);
      doc.promise.then(
        newDoc => {
          setPdfDocument(newDoc);
          extractSections(newDoc, setSections);
          setStatus('Ready');
        },
        reason => {
          setStatus('PdfError');
          console.error(reason);
        },
      );
    })();
  }, [clearPaper, fetchPaper, location, paperId, setSections]);

  return { status, pdfDocument };
};

const SHOW_INVITE_STATUS: LoadStatus[] = ['DownloadingPdf', 'Ready'];

export const CollaboratedPdf: React.FC<{ showInviteOnLoad: boolean }> = ({ showInviteOnLoad }) => {
  const [isInviteOpen, setIsInviteOpen] = useState(showInviteOnLoad);

  const paperId = usePaperId();
  const viewer = React.useRef<any>(null);
  const { status, pdfDocument } = useLoadPaper(paperId);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const { title } = usePaperStore(state => pick(state, ['title']), shallow);

  return (
    <React.Fragment>
      <Helmet>
        <title>{title || 'SciHive'}</title>
      </Helmet>
      {SHOW_INVITE_STATUS.includes(status) && false && <Invite isOpen={isInviteOpen} setIsOpen={setIsInviteOpen} />}
      <div
        className={styles.wrapper}
        style={{
          height: '100vh',
        }}
        ref={wrapperRef}
      >
        {(status === 'FetchingURL' || status === 'DownloadingPdf') && <Loader />}
        {(status === 'PdfError' || status === 'UrlNotFound') && (
          <div className={styles.notFound}>{status === 'PdfError' ? 'PDF file does not exist' : 'URL not found'}</div>
        )}
        {pdfDocument && (
          <React.Fragment>
            <ReadingProgress />
            <PdfAnnotator pdfDocument={pdfDocument} initialWidth={wrapperRef.current?.clientWidth} viewer={viewer} />
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};
