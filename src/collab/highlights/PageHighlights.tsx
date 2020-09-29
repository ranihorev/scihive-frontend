/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import React from 'react';
import baseStyles from '../../base.module.scss';
import { Popup } from '../../components/Popup';
import {
  isValidHighlight,
  PaperJump,
  TempHighlight,
  T_ExtendedHighlight,
  T_Highlight,
  T_Position,
  T_ScaledPosition,
} from '../../models';
import { HighlightContent, HighlightContentProps } from './HighlightContent';
import SingleHighlightRects from './SingleHighlightRects';

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
  jumpData?: PaperJump;
}

export const PageHighlights: React.FC<AllHighlights> = ({
  highlights,
  onHighlightClick,
  scaledPositionToViewport,
  jumpData,
}) => {
  return (
    <div
      className="my-highlight"
      css={css`
        position: absolute;
        left: 0;
        top: 0;
      `}
    >
      {highlights.map((highlight, index) => {
        const viewportPosition = scaledPositionToViewport(highlight.position);
        const isScrolledTo = Boolean(
          isValidHighlight(highlight) && jumpData && jumpData.type === 'highlight' && jumpData.id === highlight.id,
        );

        const id = isValidHighlight(highlight) ? highlight.id : `temp-${index}`;
        return <SingleHighlight key={id} {...{ highlight, onHighlightClick, viewportPosition, isScrolledTo }} />;
      })}
    </div>
  );
};
