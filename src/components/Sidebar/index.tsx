/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../stores/paper';
import { presets } from '../../utils';
import { PaperSections } from '../PaperSections';
import HighlightsList from './sidebarHighlightsList';
import { CollapseButton } from './CollapseButton';

const HEADER_HEIGHT = 36;

const tabCss = css({
  minWidth: 40,
  minHeight: HEADER_HEIGHT,
  fontSize: 12,
  padding: `4px 6px`,
  fontWeight: 400,
});

type Tab = 'Comments' | 'Sections';
interface Props {
  width: number;
  isCollapsed: boolean;
  onCollapseClick: () => void;
}

export const Sidebar: React.FC<Props> = ({ width, isCollapsed, onCollapseClick }) => {
  const { sidebarTab, setSidebarTab } = usePaperStore(state => pick(state, ['sidebarTab', 'setSidebarTab']), shallow);
  if (isCollapsed) {
    return (
      <div
        css={[
          presets.row,
          presets.centered,
          {
            position: 'absolute',
            top: 4,
            left: 0,
            zIndex: 10,
            height: HEADER_HEIGHT,
          },
        ]}
      >
        <CollapseButton isCollapsed={isCollapsed} onClick={onCollapseClick} />
      </div>
    );
  }
  let content = null;
  switch (sidebarTab) {
    case 'Comments':
      content = <HighlightsList />;
      break;
    case 'Sections':
      content = <PaperSections />;
      break;
    default:
      console.warn('Section not found');
  }

  return (
    <div
      style={{ width }}
      css={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        position: 'relative',
      }}
    >
      <div
        css={css`
          ${presets.row}
        `}
      >
        <CollapseButton isCollapsed={isCollapsed} onClick={onCollapseClick} />

        <Tabs
          value={sidebarTab}
          onChange={(e, value) => setSidebarTab(value)}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="off"
          css={{
            minHeight: HEADER_HEIGHT,
          }}
        >
          <Tab label="Comments" value="Comments" css={tabCss} />
          <Tab label="Sections" value="Sections" css={tabCss} />
        </Tabs>
      </div>
      {content}
    </div>
  );
};
