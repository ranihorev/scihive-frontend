/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { presets } from '../utils';
import HighlightsList from './HighlightsList';
import { PaperSections } from './PaperSections';
import { usePaperStore } from '../stores/paper';
import shallow from 'zustand/shallow';
import { pick } from 'lodash';

export const CollapseButton: React.FC<{ direction: 'left' | 'right'; onClick: () => void }> = ({
  direction,
  onClick,
}) => (
  <IconButton onClick={() => onClick()}>
    <i
      css={css`
        font-size: 16px;
        width: 16px;
        height: 16px;
      `}
      className={`fas fa-angle-${direction}`}
    />
  </IconButton>
);

const tabCss = css`
  min-width: 40px;
  min-height: 40px;
  padding: 6px 10px;
  font-weight: 400;
`;

type Tab = 'Comments' | 'Sections';
interface Props {
  height: number;
  width: number;
  isCollapsed: boolean;
  isVertical: boolean;
  onCollapseClick: () => void;
}

export const Sidebar: React.FC<Props> = ({ height, width, isCollapsed, isVertical, onCollapseClick }) => {
  const { sidebarTab, setSidebarTab } = usePaperStore(state => pick(state, ['sidebarTab', 'setSidebarTab']), shallow);
  if (isCollapsed) return null;
  let content = null;
  switch (sidebarTab) {
    case 'Comments':
      content = <HighlightsList isVertical={isVertical} />;
      break;
    case 'Sections':
      content = <PaperSections />;
      break;
    default:
      console.warn('Section not found');
  }

  if (isVertical) {
    return (
      <div
        style={{ height }}
        css={css`
          position: relative;
          display: flex;
        `}
      >
        {content}
      </div>
    );
  }
  return (
    <div
      style={{ width }}
      css={css`
        ${presets.col};
        flex-grow: 1;
        position: relative;
      `}
    >
      <div
        css={css`
          ${presets.row}
        `}
      >
        <CollapseButton direction={isCollapsed ? 'right' : 'left'} onClick={onCollapseClick} />

        <Tabs
          value={sidebarTab}
          onChange={(e, value) => setSidebarTab(value)}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="off"
          css={css`
            min-height: 40px;
          `}
        >
          <Tab label="Comments" value="Comments" css={tabCss} />
          <Tab label="Sections" value="Sections" css={tabCss} />
        </Tabs>
      </div>
      {content}
    </div>
  );
};
