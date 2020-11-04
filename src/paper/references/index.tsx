import { Paper, Typography } from '@material-ui/core';
import cx from 'classnames';
import React from 'react';
import ReactDom from 'react-dom';
import Linkify from 'react-linkify';
import baseStyles from '../../base.module.scss';
import { References } from '../../models';
import { usePaperStore } from '../../stores/paper';
import { PopupManager } from '../../utils/Popup';
import { useLatestCallback } from '../../utils/useLatestCallback';
import { findOrCreateLayer } from '../pdfUtils/pdfjs-dom';

export interface ActiveReference {
  anchor: HTMLElement;
  id: string;
}

interface PageCitationsProps {
  viewer: React.MutableRefObject<any>;
  pageNumber: number;
  references: References;
}

const CITATION_CLASS_NAME = 'citation';
const CITATION_TARGET = 'reference_id';

// TODO: fix type
export const PageCitations: React.FC<PageCitationsProps> = ({ viewer, pageNumber, references }) => {
  const currentCitations = references.citations.filter(citation => citation.coordinates[0]?.page === pageNumber);
  const page = viewer.current.getPageView(pageNumber - 1);
  const { viewport } = page;
  const pageHeight = viewport.viewBox[3];
  return (
    <div className="page-citations absolute top-0 left-0">
      {currentCitations.map((citation, idx) => {
        const props = {
          [`data-${CITATION_TARGET}`]: citation.target,
        };
        return (
          <React.Fragment key={idx}>
            {citation.coordinates.map((coords, coordsIdx) => {
              const [left, top] = viewport.convertToViewportPoint(coords.x, pageHeight - coords.y);
              const [width, height] = viewport.convertToViewportPoint(coords.w, pageHeight - coords.h);
              return (
                <div
                  key={`${idx}-${coordsIdx}`}
                  className={cx('absolute', CITATION_CLASS_NAME)}
                  style={{ top, left, width, height }}
                  {...props}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface UseRenderCitationsProps {
  viewer: React.MutableRefObject<any>; // TODO: replace this with proper type from pdfjs
  setActiveReference?: (reference: ActiveReference) => void;
  isDocumentReady: boolean;
  pagesReadyToRender: React.MutableRefObject<number[]>;
}

const clearLinkAnnotations = (viewer: React.MutableRefObject<any>, pageNumber: number) => {
  const pageDiv = viewer.current.getPageView(pageNumber - 1)?.div as Element | undefined;
  if (!pageDiv) return;
  const linkAnnotations = pageDiv.querySelectorAll('.linkAnnotation');
  linkAnnotations.forEach(link => link.remove());
};

export const useRenderCitations = ({
  viewer,
  isDocumentReady,
  pagesReadyToRender,
  setActiveReference,
}: UseRenderCitationsProps) => {
  const references = usePaperStore(state => state.references);
  const renderPageCitations = useLatestCallback((pageNumber: number) => {
    if (!references) return;
    const citationsLayer = findOrCreateLayer(viewer, pageNumber, 'page-citations');
    if (citationsLayer) {
      clearLinkAnnotations(viewer, pageNumber);
      ReactDom.render(<PageCitations {...{ viewer, references, pageNumber, setActiveReference }} />, citationsLayer);
    }
  });

  React.useEffect(() => {
    // Render all of the pages that are ready on every change of highlights
    if (!isDocumentReady || !references) return;
    for (const pageNumber of pagesReadyToRender.current) {
      renderPageCitations(pageNumber);
    }
  }, [isDocumentReady, pagesReadyToRender, references, renderPageCitations]);

  return renderPageCitations;
};

export const ReferencesPopupManager: React.FC<{
  activeReference?: ActiveReference;
  clearReference: () => void;
}> = ({ activeReference, clearReference }) => {
  const references = usePaperStore(state => state.references);
  if (!references) return null;
  const activeReferenceData = activeReference ? references.bibliography[activeReference.id] : undefined;
  const content = activeReferenceData ? (
    <Paper className={baseStyles.popup}>
      <Typography variant="body2" className="leading-5">
        <Linkify>{activeReferenceData.text}</Linkify>
      </Typography>
    </Paper>
  ) : null;

  return <PopupManager anchorEl={activeReference?.anchor} clearAnchor={clearReference} popupContent={content} />;
};

export const useToggleReferencesOnMove = (
  isSelecting: boolean,
  setActiveReference: React.Dispatch<ActiveReference | undefined>,
) => {
  const onMouseMove = useLatestCallback((e: React.MouseEvent) => {
    if (isSelecting) return; // Don't open popup when selecting text
    const target = e.target as HTMLElement;
    if (!target) return;
    if (target.classList.contains(CITATION_CLASS_NAME)) {
      const referenceId = target.dataset[CITATION_TARGET];
      if (!referenceId) {
        throw new Error('referenceId is undefined');
      }
      setActiveReference({ anchor: target, id: referenceId });
    }
  });
  return onMouseMove;
};
