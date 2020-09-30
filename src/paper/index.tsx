/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, CircularProgress, Typography } from '@material-ui/core';
import axios, { AxiosError } from 'axios';
import { pick } from 'lodash';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import React from 'react';
import { Helmet } from 'react-helmet';
import { queryCache, useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import baseStyles from '../base.module.scss';
import { Bookmark } from '../bookmark';
import { Invite } from '../invite';
import { References } from '../models';
import { usePaperStore } from '../stores/paper';
import { TopBar } from '../topBar';
import { usePaperId } from '../utils/hooks';
import { Spacer } from '../utils/Spacer';
import { addOrRemovePaperToGroupRequest, addRemoveGroupFromPaperCache, OnSelectGroupProps } from '../utils/useGroups';
import { useProtectedFunc } from '../utils/useProtectFunc';
import styles from './Paper.module.css';
import PdfAnnotator from './PdfAnnotator';
import { ReadingProgress } from './ReadingProgress';
import { ReferencesProvider } from './ReferencesProvider';
import { extractSections } from './sections/utils';
import { Sidebar } from './sideBar';
import { useUserStore } from '../stores/user';

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
  const { clearPaper, fetchPaper, setSections } = usePaperStore(
    state => pick(state, ['clearPaper', 'fetchPaper', 'setSections']),
    shallow,
  );

  React.useEffect(() => {
    setStatus({ state: 'FetchingURL' });
    setPdfDocument(null);
    clearPaper();
    (async () => {
      let url = '';
      try {
        const urlData = await fetchPaper({ paperId });
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
  }, [clearPaper, fetchPaper, paperId, setSections]);

  return { status, pdfDocument };
};

const SHOW_INVITE_STATES: LoadStatusState[] = ['DownloadingPdf', 'Ready'];
const LOADING_STATES: LoadStatusState[] = ['DownloadingPdf', 'FetchingURL'];

const GROUPS_Q = 'paper_groups';

interface GroupIds {
  groups: string[];
}

const PaperBookmark: React.FC<{ paperId: string }> = ({ paperId }) => {
  const isLoggedIn = useUserStore(state => state.status === 'loggedIn');
  const { data, isSuccess } = useQuery(
    GROUPS_Q,
    async () => {
      const response = await axios.get<GroupIds>(`/paper/${paperId}/groups`);
      return response.data;
    },
    { enabled: isLoggedIn },
  );

  const [onSelectGroup] = useMutation(
    async (props: OnSelectGroupProps) => {
      return addOrRemovePaperToGroupRequest({ paperId, ...props });
    },
    {
      onMutate: ({ shouldAdd, groupId }) => {
        addRemoveGroupFromPaperCache({ groupId, queryKey: GROUPS_Q, shouldAdd });

        return () => {
          return addRemoveGroupFromPaperCache({ groupId, queryKey: GROUPS_Q, shouldAdd: !shouldAdd });
        };
      },
      onError: (err, props, rollback: () => void) => {
        rollback();
        toast.error('Failed to update collection');
      },
      onSettled: () => {
        queryCache.invalidateQueries(GROUPS_Q);
      },
    },
  );

  if (!isSuccess) return null;

  return (
    <Bookmark
      color="white"
      type="single"
      paperId={paperId}
      size={20}
      selectedGroupIds={data?.groups || []}
      onSelectGroup={props => {
        onSelectGroup(props);
      }}
    />
  );
};

export const PdfPaperPage: React.FC<{ showInviteOnLoad?: boolean }> = ({ showInviteOnLoad }) => {
  const paperId = usePaperId();
  const viewer = React.useRef<any>(null);
  const { status, pdfDocument } = useLoadPaper(paperId);
  const { protectFunc } = useProtectedFunc();
  const { title, setIsInviteOpen } = usePaperStore(state => pick(state, ['title', 'setIsInviteOpen']), shallow);

  const { data: references } = useQuery(
    ['references', { paperId }],
    async () => {
      const res = await axios.get<References>(`/paper/${paperId}/references`);
      return res.data;
    },
    { refetchOnWindowFocus: false },
  );

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
          <React.Fragment>
            <PaperBookmark paperId={paperId} />
            <Button color="inherit" onClick={() => protectFunc(() => setIsInviteOpen(true))}>
              Share
            </Button>
          </React.Fragment>
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
        <React.Fragment>
          <div className={styles.wrapper}>
            <ReferencesProvider references={references}>
              <PdfAnnotator pdfDocument={pdfDocument} viewer={viewer} references={references} />
            </ReferencesProvider>
          </div>
          <div style={{ position: 'sticky', bottom: 0 }}>
            <ReadingProgress />
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
