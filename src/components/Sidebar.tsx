/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { presets } from '../utils';
import HighlightsList from './HighlightsList';
import { PaperSections } from './PaperSections';
import { actions } from '../actions';
import { Dispatch } from 'redux';

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
`;

type Tab = 'Comments' | 'Sections';
interface Props {
  selectedTab: Tab;
  setSelectedTab: (tab: Tab) => void;
  height: number;
  width: number;
  isCollapsed: boolean;
  isVertical: boolean;
  onCollapseClick: () => void;
}

const SidebarRender: React.FC<Props> = ({
  selectedTab,
  setSelectedTab,
  height,
  width,
  isCollapsed,
  isVertical,
  onCollapseClick,
}) => {
  if (isCollapsed) return null;
  let content = null;
  switch (selectedTab) {
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
          value={selectedTab}
          onChange={(e, value) => setSelectedTab(value)}
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

const mapStateToProps = (state: any) => ({
  selectedTab: state.paper.sidebarTab,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSelectedTab: (tab: Tab) => dispatch(actions.setSidebarTab(tab)),
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export const Sidebar = withRedux(SidebarRender);
