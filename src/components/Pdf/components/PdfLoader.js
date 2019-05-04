// @flow

import React, { Component } from "react";

import type { T_PDFJS_Document } from "../types";

import pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${ pdfjs.version }/pdf.worker.js`

const STATUS = {
  'LOADING': 0,
  'FAILED': -1,
  'SUCCESS': 1
}

type Props = {
  url: string,
  beforeLoad: React$Element<*>,
  failed: React$Element<*>,
  children: (pdfDocument: T_PDFJS_Document) => React$Element<*>
};

type State = {
  pdfDocument: ?T_PDFJS_Document
};

class PdfLoader extends Component<Props, State> {
  state = {
    pdfDocument: null,
    status: STATUS.LOADING
  };

  componentDidMount() {
    const { url } = this.props;
    pdfjs.getDocument(url).then(pdfDocument => {
      this.setState({
        pdfDocument: pdfDocument,
        status: STATUS.SUCCESS,
      });
    })
    .catch(e => {
      this.setState({
        status: STATUS.FAILED,
      });
    });
  }

  render() {
    const { children, beforeLoad, failed } = this.props;
    const { pdfDocument, status } = this.state;
    switch (status) {
      case STATUS.FAILED:
        return failed;
      case STATUS.SUCCESS:
        return children(pdfDocument);
      case STATUS.LOADING:
        return beforeLoad;
      default:
        return failed;
    }
  }
}

export default PdfLoader;
