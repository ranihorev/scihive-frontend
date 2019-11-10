/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import copy from 'clipboard-copy';
import React from 'react';
import { toast } from 'react-toastify';
import {
  isValidHighlight,
  JumpToData,
  TempHighlight,
  T_Highlight,
  T_LTWH,
  T_Position,
  T_ScaledPosition,
} from '../../../models';
import { presets } from '../../../utils';
import { Popup } from '../../Popup';
import { TextLinkifyLatex } from '../../TextLinkifyLatex';
import AreaHighlight from './AreaHighlight';
import Highlight from './Highlight';

const HighlightPopup: React.FC<T_Highlight> = ({ content, comment }) => {
  let copyButton;
  const hasContent = content && content.text;
  if (hasContent) {
    copyButton = (
      <span
        css={css`
          cursor: pointer;
          padding: 3px;
          margin: 0px 5px;
          &:hover {
            color: ${presets.themePalette.primary.main};
          }
        `}
        role="button"
        onClick={async () => {
          await copy(content.text || '');
          toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
        }}
      >
        <i className="far fa-copy" />
      </span>
    );
  }
  if (comment && comment.text) {
    return (
      <div>
        <Paper css={presets.popupCss}>
          <div
            css={css`
              ${presets.row};
              align-items: center;
            `}
          >
            <div
              css={
                hasContent
                  ? css`
                      border-right: 1px solid #dadada;
                      padding-right: 8px;
                    `
                  : undefined
              }
            >
              <TextLinkifyLatex text={comment.text} />
            </div>
            {copyButton}
          </div>
        </Paper>
      </div>
    );
  }
  if (hasContent) {
    return (
      <Paper
        css={css`
          ${presets.popupCss};
          padding: 6px;
        `}
      >
        {copyButton}
      </Paper>
    );
  }
  return null;
};

interface SingleHighlight {
  highlight: T_Highlight | TempHighlight;
  viewportPosition: T_Position;
  screenshot: (boundingRect: T_LTWH) => string;
  isScrolledTo: boolean;
  onHighlightClick: (id: string) => void;
}

const SingleHighlight: React.FC<SingleHighlight> = React.memo(
  ({ highlight, isScrolledTo, screenshot, viewportPosition, onHighlightClick }) => {
    const isTextHighlight = !(highlight.content && highlight.content.image);

    const component = isTextHighlight ? (
      <Highlight
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onClick={() => {
          if (!isValidHighlight(highlight)) return;
          onHighlightClick(highlight.id);
        }}
      />
    ) : (
      <AreaHighlight
        isScrolledTo={isScrolledTo}
        position={viewportPosition}
        onChange={(boundingRect: T_LTWH) => {
          // const { width, height } = highlight.position.boundingRect;
          // if (!isValidHighlight(highlight)) return;
          // this.props.updateHighlight({
          //   ...highlight,
          //   position: { ...highlight.position, boundingRect: viewportToScaled(boundingRect, { width, height }) },
          //   content: { ...highlight.content, image: screenshot(boundingRect) },
          // });
        }}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          if (!isValidHighlight(highlight)) return;
          onHighlightClick(highlight.id);
        }}
      />
    );
    if (isValidHighlight(highlight)) {
      return <Popup popupContent={<HighlightPopup {...highlight} />} bodyElement={component} />;
    }
    return component;
  },
);

interface AllHighlights {
  highlights: (T_Highlight | TempHighlight)[];
  screenshot: (boundingRect: T_LTWH) => string;
  onHighlightClick: (id: string) => void;
  scaledPositionToViewport: (position: T_ScaledPosition) => T_Position;
  jumpData?: JumpToData;
}

export const PageHighlights: React.FC<AllHighlights> = ({
  highlights,
  screenshot,
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
        return (
          <SingleHighlight key={id} {...{ highlight, onHighlightClick, viewportPosition, isScrolledTo, screenshot }} />
        );
      })}
    </div>
  );
};
