/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button } from '@material-ui/core';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../../../stores/paper';
import { EditHighlight } from '../../../EditHighlight';
import { PopoverMenu } from '../../../PopoverMenu';

export const GeneralNote: React.FC = () => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const { commentVisibility, addHighlight, paperId } = usePaperStore(
    state => pick(state, ['commentVisibility', 'addHighlight', 'paperId']),
    shallow,
  );
  const [isOpen, setIsOpen] = React.useState(false);
  if (!paperId) return null;
  return (
    <>
      <Button
        ref={ref}
        onClick={() => {
          setIsOpen(true);
        }}
        variant="contained"
        size="small"
        color="primary"
        css={{ textTransform: 'none' }}
      >
        Add General Note
      </Button>
      <PopoverMenu
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        open={isOpen}
        zIndex={9999}
        placement="bottom"
      >
        <EditHighlight
          onSubmit={data => {
            addHighlight(paperId, { visibility: data.visibility, comment: { text: data.text }, isGeneral: true })
              .then(() => {
                setIsOpen(false);
              })
              .catch(err => console.log(err.response));
          }}
          visibilitySettings={commentVisibility}
          isTextRequired={true}
        />
      </PopoverMenu>
    </>
  );
};
