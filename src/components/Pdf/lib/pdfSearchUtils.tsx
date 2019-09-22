/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import ReactDom from 'react-dom';
import { Paper } from '@material-ui/core';
import { Popup } from '../../Popup';
import { popupCss } from '../../../utils/presets';
import { PDFRenderTextLayer } from 'pdfjs-dist';

interface Match {
  begin: {
    divIdx: number;
    offset: number;
  };
  end: {
    divIdx: number;
    offset: number;
  };
}

export const convertMatches = (queryLen: number, matches: number[], textLayer: any) => {
  // Early exit if there is nothing to convert.
  const { textContentItemsStr } = textLayer;
  if (!matches) {
    return [];
  }

  let i = 0;
  let iIndex = 0;
  const end = textContentItemsStr.length - 1;
  const result: Match[] = [];

  for (let m = 0, mm = matches.length; m < mm; m++) {
    // Calculate the start position.
    let matchIdx = matches[m];

    // Loop over the divIdxs.
    while (i !== end && matchIdx >= iIndex + textContentItemsStr[i].length) {
      iIndex += textContentItemsStr[i].length;
      i++;
    }

    if (i === textContentItemsStr.length) {
      console.error('Could not find a matching mapping');
    }

    const match = {
      begin: {
        divIdx: i,
        offset: matchIdx - iIndex,
      },
    };

    matchIdx += queryLen;

    // Somewhat the same array as above, but use > instead of >= to get
    // the end position right.
    while (i !== end && matchIdx > iIndex + textContentItemsStr[i].length) {
      iIndex += textContentItemsStr[i].length;
      i++;
    }

    result.push({
      ...match,
      end: {
        divIdx: i,
        offset: matchIdx - iIndex,
      },
    });
  }
  return result;
};

export const renderMatches = (matches: Match[], pageIdx: number, textLayer: any, tooltipText: string) => {
  const { textContentItemsStr, textDivs } = textLayer;

  if (matches.length === 0) {
    return;
  }

  let prevEnd = null;
  const infinity = {
    divIdx: -1,
    offset: undefined,
  };

  const appendTextToDiv = (divIdx: number, fromOffset: number, toOffset: number | undefined, addTooltip = false) => {
    const div = textDivs[divIdx];
    const content = textContentItemsStr[divIdx].substring(fromOffset, toOffset);
    if (addTooltip) {
      const span = document.createElement('span');
      div.appendChild(span);
      ReactDom.render(
        <Popup
          popupContent={
            <Paper
              css={css`
                ${popupCss};
                text-transform: capitalize;
              `}
            >
              {tooltipText}
            </Paper>
          }
          bodyElement={
            <span
              css={css`
                border-bottom: 1px dashed #ffaa2a;
              `}
            >
              {content}
            </span>
          }
        />,
        span,
      );
    } else {
      const node = document.createTextNode(content);
      div.appendChild(node);
    }
  };

  const beginText = (begin: Match['begin']) => {
    const { divIdx } = begin;
    textDivs[divIdx].textContent = '';
    appendTextToDiv(divIdx, 0, begin.offset);
  };

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const { begin, end } = match;
    // Match inside new div.
    if (!prevEnd || begin.divIdx !== prevEnd.divIdx) {
      // If there was a previous div, then add the text at the end.
      if (prevEnd !== null) {
        appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
      }
      // Clear the divs and set the content until the starting point.
      beginText(begin);
    } else {
      appendTextToDiv(prevEnd.divIdx, prevEnd.offset, begin.offset);
    }
    appendTextToDiv(begin.divIdx, begin.offset, end.offset, true);
    prevEnd = end;
  }

  if (prevEnd) {
    appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
  }
};
