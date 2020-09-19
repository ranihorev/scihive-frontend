/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, CircularProgress, Typography } from '@material-ui/core';
import { AxiosError } from 'axios';
import { pick } from 'lodash';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import * as queryString from 'query-string';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { ReadingProgress } from '../../components/ReadingProgress';
import { extractSections } from '../../components/Sidebar/PaperSections';
import { usePaperStore } from '../../stores/paper';
import { usePaperId } from '../../utils/hooks';
import { Invite } from '../Invite';
import { Sidebar } from '../sideBar';
import { TopBar } from '../topBar';
import { Spacer } from '../utils/Spacer';
import styles from './Paper.module.css';
import PdfAnnotator from './PdfAnnotator';

const Loader = () => (
  <div className={styles.fullScreen}>
    <Typography>Loading Paper</Typography>
    <Spacer size={8} />
    <CircularProgress />
  </div>
);

type LoadStatus = { state: 'FetchingURL' | 'DownloadingPdf' | 'Ready' } | { state: 'Error'; reason: string };
type LoadStatusState = LoadStatus['state'];

const isAxiosError = (e: Error): e is AxiosError => {
  return e.hasOwnProperty('isAxiosError');
};

const errorCodeToMessage = {
  403: 'You do not have permissions to view this paper',
  404: 'Paper not found',
  500: 'Server error :(',
};

const DEFAULT_ERROR_MESSAGE = 'Unknown Error';

const useLoadPaper = (paperId: string) => {
  const [status, setStatus] = React.useState<LoadStatus>({ state: 'FetchingURL' });
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(null);
  const location = useLocation();
  const { clearPaper, fetchPaper, setSections } = usePaperStore(
    state => pick(state, ['clearPaper', 'fetchPaper', 'setSections']),
    shallow,
  );

  React.useEffect(() => {
    setStatus({ state: 'FetchingURL' });
    setPdfDocument(null);
    clearPaper();
    (async () => {
      const selectedGroupId = queryString.parse(location.search).list as string;
      let url = '';
      try {
        const urlData = await fetchPaper({ paperId, selectedGroupId, hash: location.hash, isCollab: true });
        url = urlData.url;
      } catch (e) {
        console.error(e.response);
        if (isAxiosError(e)) {
          const errorCode = e.response?.status as keyof typeof errorCodeToMessage;
          let reason = errorCodeToMessage[errorCode] || DEFAULT_ERROR_MESSAGE;
          reason = errorCode === 403 && e.response?.data ? e.response.data : reason;
          setStatus({ state: 'Error', reason: reason });
        } else {
          setStatus({ state: 'Error', reason: 'Unknown Error' });
        }
        return;
      }
      setStatus({ state: 'DownloadingPdf' });
      const doc = getDocument(url);
      doc.promise.then(
        newDoc => {
          setPdfDocument(newDoc);
          extractSections(newDoc, setSections);
          setStatus({ state: 'Ready' });
        },
        reason => {
          setStatus({ state: 'Error', reason: 'Failed to load PDF' });
          console.error(reason);
        },
      );
    })();
  }, [clearPaper, fetchPaper, location, paperId, setSections]);

  return { status, pdfDocument };
};

const SHOW_INVITE_STATES: LoadStatusState[] = ['DownloadingPdf', 'Ready'];
const LOADING_STATES: LoadStatusState[] = ['DownloadingPdf', 'FetchingURL'];

export const CollaboratedPdf: React.FC<{ showInviteOnLoad?: boolean }> = ({ showInviteOnLoad }) => {
  const paperId = usePaperId();
  const viewer = React.useRef<any>(null);
  const { status, pdfDocument } = useLoadPaper(paperId);

  const { title, setIsInviteOpen } = usePaperStore(state => pick(state, ['title', 'setIsInviteOpen']), shallow);

  React.useEffect(() => {
    if (SHOW_INVITE_STATES.includes(status.state) && showInviteOnLoad) {
      setIsInviteOpen(true);
    }
  }, [setIsInviteOpen, showInviteOnLoad, status]);

  return (
    <div className={baseStyles.fullScreen}>
      <Helmet>
        <title>{title || 'SciHive'}</title>
      </Helmet>
      <Invite />
      <TopBar
        rightMenu={
          <Button color="inherit" onClick={() => setIsInviteOpen(true)}>
            Share
          </Button>
        }
        drawerContent={<Sidebar />}
      />
      {LOADING_STATES.includes(status.state) && <Loader />}
      {status.state === 'Error' && (
        <div className={baseStyles.fullScreen}>
          <div className={baseStyles.screenCentered}>{status.reason}</div>
        </div>
      )}
      {pdfDocument && status.state === 'Ready' && (
        <div className={styles.wrapper}>
          <React.Fragment>
            <ReadingProgress />
            <PdfAnnotator pdfDocument={pdfDocument} viewer={viewer} />
          </React.Fragment>
        </div>
      )}
    </div>
  );
};
