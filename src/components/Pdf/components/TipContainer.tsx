/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Popper } from '@material-ui/core';
import { PopperProps } from '@material-ui/core/Popper';
import { isEmpty, pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../stores/paper';
import Tip from './Tip';

export const TipContainer: React.FC<{ isOnboarding?: boolean }> = React.memo(({ isOnboarding = false }) => {
  // const [key, setKey] = React.useState(false); // used to reload the popper
  const tooltipNode = React.useRef<HTMLDivElement>(null);
  const popperRef: PopperProps['popperRef'] = React.useRef(null);
  const { tempHighlight } = usePaperStore(state => pick(state, ['tempHighlight']), shallow);
  const tooltipSize = tempHighlight?.size;
  return (
    <React.Fragment>
      <div
        className="tooltip-wrapper"
        ref={tooltipNode}
        css={css`
          position: absolute;
        `}
        style={{ ...tooltipSize, height: tooltipSize ? tooltipSize.bottom - tooltipSize.top : undefined }}
      />
      <Popper
        open={!isEmpty(tempHighlight)}
        anchorEl={tooltipNode.current}
        placement="top"
        className="tooltip-popper"
        disablePortal={false}
        popperRef={popperRef}
        css={css`
          z-index: 100;
        `}
        modifiers={{
          flip: {
            enabled: true,
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: 'scrollParent',
          },
          offset: {
            offset: `0,2`,
          },
        }}
      >
        <Tip
          onMouseDown={e => {
            e.stopPropagation();
          }}
          updateTipPosition={() => {
            if (popperRef.current) {
              popperRef.current.update();
            }
          }}
          isOnboarding={isOnboarding}
        />
      </Popper>
    </React.Fragment>
  );
});
