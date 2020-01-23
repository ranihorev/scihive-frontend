import React from 'react';
import { usePaperStore } from '../../../../stores/paper';
import { Button } from '@material-ui/core';
import { PopoverMenu } from '../../../PopoverMenu';
import { pick } from 'lodash';
import { EditHighlight } from '../../../EditHighlight';
import shallow from 'zustand/shallow';

export const GeneralNote: React.FC = () => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const { commentVisibilty, addHighlight, paperId } = usePaperStore(
    state => pick(state, ['commentVisibilty', 'addHighlight', 'paperId']),
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
      >
        Add Note
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
          visibilitySettings={commentVisibilty}
          isTextRequired={true}
        />
      </PopoverMenu>
    </>
  );
};
