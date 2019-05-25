/* global chrome */
import React from 'react';
import { isMobile, isChrome } from 'react-device-detect';
import { toast } from 'react-toastify';

const chromeExtensionPopup = () => {
  if (isChrome && !isMobile) {
    chrome.runtime.sendMessage(
      'dgdpljnpkcomjlebdbcmpikppphlehmm',
      'version',
      reply => {
        if (!reply) {
          toast.info(
            <React.Fragment>
              <div style={{ paddingBottom: 7 }}>
                Want to open arXiv papers directly on SciHive?
              </div>
              <div>
                <a
                  href="https://chrome.google.com/webstore/detail/arxivcolab/dijdhkcfdaocpepndegmbkgphbpomdai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white' }}
                >
                  Download
                </a>{' '}
                our chrome extension!
              </div>
            </React.Fragment>,
            {
              className: 'download-extesion'
            }
          );
        }
      }
    );
  }
};

export default chromeExtensionPopup;
