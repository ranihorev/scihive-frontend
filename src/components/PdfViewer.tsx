/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import { pick } from 'lodash';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { Reference } from '../models';
import { usePaperStore } from '../stores/paper';
import { presets } from '../utils';
import { popupCss } from '../utils/presets';
import { PdfAnnotator, PdfLoader } from './Pdf';
import { PopupManager } from './Popup';

const ReferencesPopupManager: React.FC<{
  referencePopoverAnchor?: HTMLElement;
  clearAnchor: () => void;
  reference: Reference;
}> = ({ referencePopoverAnchor, clearAnchor, reference }) => {
  const content = reference ? (
    <Paper css={popupCss}>
      {reference.arxivId && (
        <div
          css={css`
            ${presets.row};
            width: 100%;
            justify-content: flex-end;
          `}
        >
          <Link
            to={`/paper/${reference.arxivId}`}
            css={css`
              color: ${presets.themePalette.primary.main};
            `}
          >
            <i className="fas fa-external-link-alt" />
          </Link>
        </div>
      )}
      <div
        css={css`
          p {
            margin: 0.2rem;
          }
        `}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: reference.html }}
      />
    </Paper>
  ) : null;

  return <PopupManager anchorEl={referencePopoverAnchor} clearAnchor={clearAnchor} popupContent={content} />;
};

interface PdfViewerProps {
  url: string;
  isVertical: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, isVertical }) => {
  const { references } = usePaperStore(state => pick(state, ['references']), shallow);
  const [referencePopoverState, setReferencePopoverState] = React.useState<{ anchor?: HTMLElement; citeId: string }>({
    citeId: '',
  });
  const [highlightPopoverAnchor, setHighlightPopoverAnchor] = React.useState<HTMLElement | undefined>();

  return (
    <React.Fragment>
      <PdfLoader key={url} url={url}>
        <PdfAnnotator
          enableAreaSelection={event => event.altKey}
          isVertical={isVertical}
          onReferenceEnter={e => {
            const target = e.target as HTMLElement;
            if (!target) return;
            const cite = decodeURIComponent((target.getAttribute('href') || '').replace('#cite.', ''));
            if (references.hasOwnProperty(cite)) {
              if (isMobile) {
                target.onclick = event => {
                  event.preventDefault();
                };
              }
              if (e.type === 'click' && !isMobile) {
                setReferencePopoverState({ citeId: '' });
              } else {
                setReferencePopoverState({ anchor: target, citeId: cite });
              }
            }
          }}
        />
      </PdfLoader>
      {references && (
        <ReferencesPopupManager
          referencePopoverAnchor={referencePopoverState.anchor}
          clearAnchor={() => setReferencePopoverState({ citeId: '' })}
          reference={references[referencePopoverState.citeId]}
        />
      )}
      <PopupManager
        anchorEl={highlightPopoverAnchor}
        clearAnchor={() => {
          setHighlightPopoverAnchor(undefined);
        }}
        popupContent={<div>Hello</div>}
      />
    </React.Fragment>
  );
};

export default PdfViewer;
