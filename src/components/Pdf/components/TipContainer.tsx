/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Popper } from '@material-ui/core';
import { PopperProps } from '@material-ui/core/Popper';
import axios from 'axios';
import { isEmpty } from 'lodash';
import React from 'react';
import useReactRouter from 'use-react-router';
import { T_Highlight, T_NewHighlight, T_ScaledPosition, Visibility } from '../../../models';
import Tip from './Tip';

export interface TooltipData {
  position: T_ScaledPosition;
  content: T_NewHighlight['content'];
  size: { left: number; top: number; bottom: number };
}

interface TipContainerProps {
  tooltipData: TooltipData | undefined;
  onSuccess: (highlight: T_Highlight) => void;
}

export const TipContainer: React.FC<TipContainerProps> = ({ tooltipData, onSuccess }) => {
  // const [key, setKey] = React.useState(false); // used to reload the popper
  const tooltipNode = React.useRef<HTMLDivElement>(null);
  const popperRef: PopperProps['popperRef'] = React.useRef(null);
  const {
    match: { params },
  } = useReactRouter();

  const submitHighlight = (data: T_NewHighlight) => {
    axios
      .post(`/paper/${params.PaperId}/new_comment`, data)
      .then(res => {
        onSuccess(res.data.comment);
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  return (
    <React.Fragment>
      <div
        className="tooltip-wrapper"
        ref={tooltipNode}
        css={css`
          position: absolute;
        `}
        style={tooltipData ? tooltipData.size : undefined}
      />
      <Popper
        open={!isEmpty(tooltipData)}
        anchorEl={tooltipNode.current}
        placement="top"
        className="tooltip-popper"
        disablePortal={true}
        popperRef={popperRef}
        css={css`
          z-index: 100;
        `}
        modifiers={{
          flip: {
            enabled: true,
          },
        }}
      >
        <Tip
          onMouseDown={e => {
            e.stopPropagation();
          }}
          onOpen={() => {
            if (popperRef.current) {
              popperRef.current.update();
            }
          }}
          onConfirm={(comment: T_Highlight['comment'], visibility: Visibility) => {
            if (tooltipData) {
              submitHighlight({ comment, visibility, content: tooltipData.content, position: tooltipData.position });
            }
          }}
        />
      </Popper>
    </React.Fragment>
  );
};
