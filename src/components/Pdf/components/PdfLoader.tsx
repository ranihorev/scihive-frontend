/** @jsx jsx */
import { jsx } from '@emotion/core';
import { pick } from 'lodash';
import pdfjs, { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import React from 'react';
import { isMobile } from 'react-device-detect';
import shallow from 'zustand/shallow';
import { PdfAnnotator } from '..';
import { usePaperStore } from '../../../stores/paper';
import { extractSections } from '../../Sidebar/PaperSections';
import { ReferencesPopoverState } from '../../ReferencesProvider';

(pdfjs as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
  (pdfjs as any).version
}/pdf.worker.js`;

interface PdfViewerProps {
  url: string;
  setReferencePopoverState?: (props: ReferencesPopoverState) => void;
}

enum STATUS {
  LOADING = 0,
  FAILED = -1,
  SUCCESS = 1,
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, setReferencePopoverState }) => {
  const [status, setStatus] = React.useState<STATUS>(STATUS.LOADING);
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy>();
  const setSections = usePaperStore(state => state.setSections, shallow);

  React.useEffect(() => {
    const doc = getDocument(url);
    doc.promise.then(
      (newDoc: PDFDocumentProxy) => {
        setPdfDocument(newDoc);
        extractSections(newDoc, setSections);
        setStatus(STATUS.SUCCESS);
      },
      reason => console.error(reason),
    );
  }, [url, setPdfDocument, setStatus, setSections]);

  return (
    <React.Fragment>
      {status === STATUS.SUCCESS && pdfDocument && (
        <PdfAnnotator
          pdfDocument={pdfDocument}
          enableAreaSelection={event => event.altKey}
          setReferencePopoverState={setReferencePopoverState}
        />
      )}
    </React.Fragment>
  );
};

export default PdfViewer;
