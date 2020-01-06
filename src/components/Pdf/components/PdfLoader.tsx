import { pick } from 'lodash';
import pdfjs, { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { extractSections } from '../../PaperSections';

(pdfjs as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
  (pdfjs as any).version
}/pdf.worker.js`;

enum STATUS {
  LOADING = 0,
  FAILED = -1,
  SUCCESS = 1,
}

interface Props {
  url: string;
  children: React.ReactElement;
}

const PdfLoader: React.FC<Props> = ({ url, children }) => {
  const [status, setStatus] = React.useState<STATUS>(STATUS.LOADING);
  const { setDocument, setSections, document: pdfDocument } = usePaperStore(
    state => pick(state, ['setDocument', 'setSections', 'document']),
    shallow,
  );

  React.useEffect(() => {
    const doc = getDocument(url);
    doc.promise.then(
      (newDoc: PDFDocumentProxy) => {
        setDocument(newDoc);
        extractSections(newDoc, setSections);
        setStatus(STATUS.SUCCESS);
      },
      reason => console.error(reason),
    );
  }, []);

  if (status === STATUS.SUCCESS && pdfDocument) {
    return children;
  }
  return null;
};

export default PdfLoader;
