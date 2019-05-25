/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { presets } from '../utils';
import CommentsList from './CommentsList';
import { PaperSections } from './PaperSections';

export const CollapseButton = ({ direction, onClick }) => (
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
  & .label-container {
    padding: 6px 14px;
  }
`;

export const Sidebar = ({
  height,
  width,
  isCollapsed,
  isVertical,
  onCollapseClick
}) => {
  if (isCollapsed) return null;
  const [selectedTab, setSelectedTab] = React.useState('Comments');
  let content = null;
  switch (selectedTab) {
    case 'Comments':
      content = <CommentsList isVertical={isVertical} />;
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
        <CollapseButton
          direction={isCollapsed ? 'right' : 'left'}
          onClick={onCollapseClick}
        />

        <Tabs
          value={selectedTab}
          onChange={(e, value) => setSelectedTab(value)}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="off"
          css={css`
            min-height: 40px;
          `}
        >
          <Tab
            label="Comments"
            value="Comments"
            classes={{ labelContainer: 'label-container' }}
            css={tabCss}
          />
          <Tab
            label="Sections"
            value="Sections"
            classes={{ labelContainer: 'label-container' }}
            css={tabCss}
          />
        </Tabs>
      </div>
      {content}
    </div>
  );
};
