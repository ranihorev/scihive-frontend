/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Typography } from '@material-ui/core';
import { pick } from 'lodash';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, version as pdfJsVersion } from 'pdfjs-dist';
import React from 'react';
import shallow from 'zustand/shallow';
import { LoginForm } from '../auth/LoginForm';
import baseStyles from '../base.module.scss';
import { usePaperStore } from '../stores/paper';
import { useUserStore } from '../stores/user';
import { isAxiosError } from '../utils';
import { usePaperId, useToken } from '../utils/hooks';
import { Spacer } from '../utils/Spacer';
import { useLatestCallback } from '../utils/useLatestCallback';
import { LoaderPlaceholder } from './LoaderPlaceholder';
import { LoadStatus, LoadStatusState } from './models';
import styles from './Paper.module.css';
import PdfAnnotator from './PdfAnnotator';
import { ReadingProgress } from './ReadingProgress';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.js`;

const errorCodeToMessage = {
  403: 'You do not have permissions to view this paper',
  404: 'Paper not found',
  500: 'Server error :(',
};

const DEFAULT_ERROR_MESSAGE = 'Unknown Error';

const useLoadPaper = (paperId: string) => {
  const [status, setStatus] = React.useState<LoadStatus>({ state: 'FetchingURL' });
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(null);
  const token = useToken();

  // TODO: Switch to useQuery!
  const { clearPaper, fetchPaper } = usePaperStore(state => pick(state, ['clearPaper', 'fetchPaper']), shallow);

  const isLoggedIn = useUserStore(state => state.status === 'loggedIn');
  const permissionError = React.useRef(false);

  const loadPaperHelper = useLatestCallback(() => {
    setStatus({ state: 'FetchingURL' });
    setPdfDocument(null);
    clearPaper();
    (async () => {
      let url = '';
      try {
        const urlData = await fetchPaper({ paperId, token });
        url = urlData.url;
      } catch (e) {
        console.error(e.response);
        if (isAxiosError(e)) {
          const errorCode = e.response?.status as keyof typeof errorCodeToMessage;
          let reason = errorCodeToMessage[errorCode] || DEFAULT_ERROR_MESSAGE;
          reason = errorCode === 403 && e.response?.data ? e.response.data.message : reason;
          setStatus({ state: 'Error', reason: reason, code: errorCode });
          permissionError.current = true;
        } else {
          setStatus({ state: 'Error', reason: 'Unknown Error' });
        }
        return;
      }
      permissionError.current = false;
      setStatus({ state: 'DownloadingPdf' });
      const doc = getDocument(url);
      doc.promise.then(
        newDoc => {
          setPdfDocument(newDoc);
          setStatus({ state: 'Ready' });
        },
        reason => {
          setStatus({ state: 'Error', reason: 'Failed to load PDF' });
          console.error(reason);
        },
      );
    })();
  });

  React.useEffect(() => {
    if (permissionError.current && (isLoggedIn || token)) {
      loadPaperHelper();
    }
  }, [isLoggedIn, loadPaperHelper, token]);

  React.useEffect(() => {
    loadPaperHelper();
  }, [loadPaperHelper, paperId]);

  return { status, pdfDocument };
};

const SHOW_INVITE_STATES: LoadStatusState[] = ['DownloadingPdf', 'Ready'];
const LOADING_STATES: LoadStatusState[] = ['DownloadingPdf', 'FetchingURL'];

const PdfPaperPage: React.FC<{ showInviteOnLoad?: boolean }> = ({ showInviteOnLoad }) => {
  const paperId = usePaperId();
  const viewer = React.useRef<any>(null);
  const { status, pdfDocument } = useLoadPaper(paperId);
  const setIsInviteOpen = usePaperStore(state => state.setIsInviteOpen);
  const isLoggedIn = useUserStore(state => state.status === 'loggedIn');

  React.useEffect(() => {
    if (SHOW_INVITE_STATES.includes(status.state) && showInviteOnLoad) {
      setIsInviteOpen(true);
    }
  }, [setIsInviteOpen, showInviteOnLoad, status]);

  return (
    <React.Fragment>
      {LOADING_STATES.includes(status.state) && <LoaderPlaceholder />}
      {status.state === 'Error' && (
        <div className={baseStyles.fullScreen}>
          <div className={baseStyles.screenCentered}>
            {!isLoggedIn && status.code === 403 ? (
              <React.Fragment>
                <Typography>This paper is private and can only be accessed by authorized users.</Typography>
                <Typography>
                  If you have permissions, please log in first{' '}
                  <span role="img" aria-label="please">
                    🙏
                  </span>
                </Typography>
                <Spacer size={24} />
                <LoginForm enableRedirect={false} />
              </React.Fragment>
            ) : (
              <Typography>{status.reason}</Typography>
            )}
          </div>
        </div>
      )}
      {pdfDocument && status.state === 'Ready' && (
        <React.Fragment>
          <div className={styles.wrapper}>
            <PdfAnnotator pdfDocument={pdfDocument} viewer={viewer} />
          </div>
          <div style={{ position: 'sticky', bottom: 0 }}>
            <ReadingProgress />
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default PdfPaperPage;
