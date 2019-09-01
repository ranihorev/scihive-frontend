import pdfjs, { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../../actions';
import { extractSections } from '../../PaperSections';
import { Dispatch } from 'redux';

(pdfjs as any).GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as any).version}/pdf.worker.js`;

const STATUS = {
  'LOADING': 0,
  'FAILED': -1,
  'SUCCESS': 1,
};

interface Props {
  url: string,
  beforeLoad: React.ReactElement,
  failed: React.ReactElement,
  children: (pdfDocument: PDFDocumentProxy) => React.ReactElement,
  setDocument: (pdfDocument: PDFDocumentProxy) => void,
  setSections: (sections: any[]) => void,
};

type State = {
  pdfDocument?: PDFDocumentProxy,
  status:
    number
};

class PdfLoader extends React.Component<Props, State> {
  state: State = { pdfDocument: undefined, status: STATUS.LOADING };

  componentDidMount() {
    const { url } = this.props;
    const doc = getDocument(url);
    doc.promise.then((pdfDocument: any) => {
      this.props.setDocument(pdfDocument);
      extractSections(pdfDocument, this.props.setSections);
      this.setState({
        pdfDocument,
        status: STATUS.SUCCESS,
      });
    });
    // .catch(() => {
    //   this.setState({
    //     status: STATUS.FAILED,
    //   });
    // });

  }

  render() {
    const { children, beforeLoad, failed } = this.props;
    const { pdfDocument, status } = this.state;
    switch (status) {
      case STATUS.FAILED:
        return failed;
      case STATUS.SUCCESS:
        if (!pdfDocument) throw Error('Document is missing');
        return children(pdfDocument);
      case STATUS.LOADING:
        return beforeLoad;
      default:
        return failed;
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDocument: (document: PDFDocumentProxy) => {
    dispatch(actions.setDocument(document));
  },
  setSections: (sections: any[]) => {
    dispatch(actions.setSections(sections));
  },
});


const withRedux = connect(undefined, mapDispatchToProps);

export default withRedux(PdfLoader);
