/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import baseStyles from '../base.module.scss';
import { Invite } from '../invite';
import { usePaperStore } from '../stores/paper';
import { usePaperId } from '../utils/hooks';
import { LoaderPlaceholder } from './LoaderPlaceholder';
import { MenuBars } from './MenuBars';

const PageContent = React.lazy(() => import('./PdfPaperPage'));

export const PdfPaperPage: React.FC<{ showInviteOnLoad?: boolean }> = ({ showInviteOnLoad }) => {
  const paperId = usePaperId();
  const title = usePaperStore(state => state.title);

  return (
    <div className={baseStyles.fullScreen}>
      <Helmet>
        <title>{title || 'SciHive'}</title>
      </Helmet>
      <Invite />
      <MenuBars paperId={paperId} />
      <Suspense fallback={<LoaderPlaceholder />}>
        <PageContent />
      </Suspense>
    </div>
  );
};
