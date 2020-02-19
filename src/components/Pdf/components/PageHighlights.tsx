/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import copy from 'clipboard-copy';
import { pick } from 'lodash';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import {
  isValidHighlight,
  PaperJump,
  TempHighlight,
  T_ExtendedHighlight,
  T_Highlight,
  T_LTWH,
  T_Position,
  T_ScaledPosition,
} from '../../../models';
import { usePaperStore } from '../../../stores/paper';
import { presets } from '../../../utils';
import { Popup } from '../../Popup';
import { TextLinkifyLatex } from '../../TextLinkifyLatex';
import AreaHighlight from './AreaHighlight';
import Highlight from './Highlight';
import { EditHighlight } from '../../EditHighlight';

const ActionButton: React.FC<{ onClick: () => void; icon: string }> = ({ onClick, icon }) => (
  <span
    css={css`
      cursor: pointer;
      padding: 3px;
      &:not(:first-of-type) {
        margin-left: 5px;
      }
      &:hover {
        color: ${presets.themePalette.primary.main};
      }
    `}
    role="button"
    onClick={onClick}
  >
    <i className={icon} />
  </span>
);

interface PopupContentProps extends T_Highlight {
  onResize?: () => void;
  onHide?: () => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ content, visibility, comment, canEdit, id, onResize, onHide }) => {
  const contentText = (content && content.text) || '';
  const hasContent = Boolean(contentText);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { removeHighlight, updateHighlight } = usePaperStore(state => {
    return {
      removeHighlight: canEdit ? state.removeHighlight : undefined,
      updateHighlight: state.updateHighlight,
    };
  }, shallow);
  React.useEffect(() => {
    onResize && onResize();
  }, [onResize, isEditOpen]);
  const hasComment = Boolean(comment && comment.text);
  if (![hasComment, hasContent, removeHighlight].some(Boolean)) return null;
  if (isEditOpen) {
    return (
      <EditHighlight
        text={comment.text}
        onSubmit={data => {
          updateHighlight(id, data)
            .then(() => {
              onHide && onHide();
            })
            .catch(err => console.error(err.response));
        }}
        visibilitySettings={visibility}
        isTextRequired={false}
      />
    );
  }
  return (
    <Paper css={[presets.popupCss, { minWidth: hasComment ? 120 : undefined }]}>
      <div css={presets.col}>
        {hasComment && (
          <div>
            <TextLinkifyLatex text={comment.text} />
          </div>
        )}
        <div
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: hasComment ? 6 : 0,
          }}
        >
          {hasContent && (
            <ActionButton
              onClick={async () => {
                await copy(contentText);
                toast.success('Highlight has been copied to clipboard', { autoClose: 2000 });
              }}
              icon="far fa-copy"
            />
          )}
          {canEdit && <ActionButton icon="fas fa-pencil-alt" onClick={() => setIsEditOpen(true)} />}
          {removeHighlight && <ActionButton icon="far fa-trash-alt" onClick={() => removeHighlight(id)} />}
        </div>
      </div>
    </Paper>
  );

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
        onChange={(boundingRect: T_LTWH) => {}}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          if (!isValidHighlight(highlight)) return;
          onHighlightClick(highlight.id);
        }}
      />
    );
    if (isValidHighlight(highlight)) {
      return <Popup popupContent={<PopupContent {...highlight} />} bodyElement={component} />;
    }
    return component;
  },
);

interface AllHighlights {
  highlights: T_ExtendedHighlight[];
  screenshot: (boundingRect: T_LTWH) => string;
  onHighlightClick: (id: string) => void;
  scaledPositionToViewport: (position: T_ScaledPosition) => T_Position;
  jumpData?: PaperJump;
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
