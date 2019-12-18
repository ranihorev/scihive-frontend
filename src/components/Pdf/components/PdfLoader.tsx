import pdfjs, { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '../../../actions';
import { Section } from '../../../models';
import { extractSections } from '../../PaperSections';

(pdfjs as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
  (pdfjs as any).version
}/pdf.worker.js`;

const STATUS = {
  LOADING: 0,
  FAILED: -1,
  SUCCESS: 1,
};

interface Props {
  url: string;
  beforeLoad: React.ReactElement;
  failed: React.ReactElement;
  children: (pdfDocument: PDFDocumentProxy) => React.ReactElement;
  setDocument: (pdfDocument: PDFDocumentProxy) => void;
  setSections: (sections: Section[]) => void;
}

type State = {
  pdfDocument?: PDFDocumentProxy;
  status: number;
};

class PdfLoader extends React.Component<Props, State> {
  state: State = { pdfDocument: undefined, status: STATUS.LOADING };

  componentDidMount() {
    const { url } = this.props;
    const doc = getDocument(url);
    doc.promise.then(
      (pdfDocument: PDFDocumentProxy) => {
        this.props.setDocument(pdfDocument);
        extractSections(pdfDocument, this.props.setSections);
        this.setState({
          pdfDocument,
          status: STATUS.SUCCESS,
        });
      },
      reason => console.error(reason),
    );
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
  setSections: (sections: Section[]) => {
    dispatch(actions.setSections(sections));
  },
});

const withRedux = connect(undefined, mapDispatchToProps);

export default withRedux(PdfLoader);
