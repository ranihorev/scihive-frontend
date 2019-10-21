/* global chrome */
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { isMobile, isChrome } from 'react-device-detect';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { linkButton } from './presets';

const EXTENSION_ID = process.env.REACT_APP_EXTENSION_ID as string;
const EXTENSION_COOKIE = 'EXTENSION_COOKIE';

const ChromeExtensionPopup: React.FC = () => {
  const [cookies, setCookie] = useCookies([EXTENSION_COOKIE]);
  React.useEffect(() => {
    if (cookies[EXTENSION_COOKIE]) return;
    if (!isChrome || isMobile || typeof chrome === 'undefined') return;
    try {
      chrome.runtime.sendMessage(EXTENSION_ID, 'version', reply => {
        if (!reply) {
          const toastId = toast.info(
            <React.Fragment>
              <div style={{ paddingBottom: 7 }}>Want to open arXiv papers directly on SciHive?</div>
              <div>
                <a
                  href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit' }}
                >
                  Download
                </a>{' '}
                our chrome extension!
              </div>
              <div css={css({ marginTop: 10, fontSize: 10 })}>
                <button
                  type="button"
                  css={linkButton}
                  onClick={() => {
                    setCookie(EXTENSION_COOKIE, 1, { maxAge: 60 * 60 * 24 * 30 });
                    toast.dismiss(toastId);
                  }}
                >
                  Don't show again
                </button>
              </div>
            </React.Fragment>,
            {
              className: 'download-extesion',
            },
          );
        }
      });
    } catch (e) {
      console.warn('failed to send message to extension');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ChromeExtensionPopup;
