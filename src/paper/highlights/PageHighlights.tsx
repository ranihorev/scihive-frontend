/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import React from 'react';
import baseStyles from '../../base.module.scss';
import {
  isValidHighlight,
  PaperJump,
  TempHighlight,
  T_ExtendedHighlight,
  T_Highlight,
  T_Position,
  T_ScaledPosition,
} from '../../models';
import { Popup } from '../../utils/Popup';
import { HighlightContent, HighlightContentProps } from './HighlightContent';
import SingleHighlightRects from './SingleHighlightRects';
import { createListener } from '../../utils';
import { JUMP_TO_EVENT } from '../../utils/useJumpToHandler';

const PopupHighlightContent: React.FC<HighlightContentProps> = props => {
  return (
    <Paper className={baseStyles.popup}>
      <HighlightContent {...props} />
    </Paper>
  );
};

interface SingleHighlight {
  highlight: T_Highlight | TempHighlight;
  viewportPosition: T_Position;
  isScrolledTo: boolean;
  onHighlightClick?: (id: string) => void;
}

const SingleHighlight: React.FC<SingleHighlight> = React.memo(
  ({ highlight, isScrolledTo, viewportPosition, onHighlightClick }) => {
    const component = (
      <SingleHighlightRects
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onClick={() => {
          if (!isValidHighlight(highlight)) return;
          onHighlightClick?.(highlight.id);
        }}
      />
    );
    if (isValidHighlight(highlight)) {
      return <Popup popupContent={<PopupHighlightContent {...highlight} />} bodyElement={component} />;
    }
    return component;
  },
);

interface AllHighlights {
  highlights: T_ExtendedHighlight[];
  onHighlightClick?: (id: string) => void;
  scaledPositionToViewport: (position: T_ScaledPosition) => T_Position;
  pageNumber: number;
}

export const PageHighlights: React.FC<AllHighlights> = ({
  highlights,
  onHighlightClick,
  scaledPositionToViewport,
  pageNumber,
}) => {
  const [scrollToId, setScrollToId] = React.useState<string | undefined>();

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    const removeListener = createListener<PaperJump>(JUMP_TO_EVENT, event => {
      if (event.detail.type === 'highlight' && event.detail.location.pageNumber === pageNumber) {
        setScrollToId(event.detail.id);
        timeoutId = setTimeout(() => {
          setScrollToId(undefined);
        }, 2000);
      }
    });
    return () => {
      removeListener();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pageNumber]);

  return (
    <div
      className="page-highlight"
      css={css`
        position: absolute;
        left: 0;
        top: 0;
      `}
    >
      {highlights.map((highlight, index) => {
        const viewportPosition = scaledPositionToViewport(highlight.position);
        const isScrolledTo = Boolean(isValidHighlight(highlight) && scrollToId === highlight.id);

        const id = isValidHighlight(highlight) ? highlight.id : `temp-${index}`;
        return <SingleHighlight key={id} {...{ highlight, onHighlightClick, viewportPosition, isScrolledTo }} />;
      })}
    </div>
  );
};
