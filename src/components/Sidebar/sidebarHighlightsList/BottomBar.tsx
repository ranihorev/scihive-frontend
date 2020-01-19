/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Switch } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import { COLORS, themePalette } from '../../../utils/presets';

interface Props {
  hideQuoteHighlights: boolean;
  setHideQuoteHighlights: (state: boolean) => void;
}

const floatingIconCss = css({
  color: themePalette.primary.main,
  fontSize2: 14,
});

export const BottomBar: React.FC<Props> = ({ hideQuoteHighlights, setHideQuoteHighlights }) => {
  const { isHighlightsHidden, toggleHighlightsVisiblity } = usePaperStore(
    state => ({
      ...pick(state, ['toggleHighlightsVisiblity']),
      isHighlightsHidden: !isEmpty(state.hiddenHighlights),
    }),
    shallow,
  );

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 5,
        paddingTop: 0,
      }}
    >
      <div css={{ display: 'flex', flexDirection: 'row', fontSize: 12, alignItems: 'center', color: COLORS.grey }}>
        <Switch
          checked={!hideQuoteHighlights}
          onChange={() => setHideQuoteHighlights(!hideQuoteHighlights)}
          size="small"
          color="primary"
        />
        Highlights
      </div>
      <div>
        <Tooltip title={`${isHighlightsHidden ? 'Show' : 'Hide'} all comments`} placement="top">
          <IconButton onClick={() => toggleHighlightsVisiblity()}>
            <i className={`fas ${isHighlightsHidden ? 'fa-eye-slash' : 'fa-eye'}`} css={floatingIconCss} />
          </IconButton>
        </Tooltip>
        <Tooltip title="To create area highlight hold Option/Alt key, then click and drag." placement="top">
          <IconButton>
            <i className="fas fa-info-circle" css={floatingIconCss} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};
