/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button } from '@material-ui/core';
import React from 'react';
import { toast } from 'react-toastify';
import { Group } from '../models';
import { presets } from '../utils';

const buttonCss = css({});

export const notifyOnNewGroup = (group: Group, joinGroup: () => void) => {
  const toastId = toast.info(
    <React.Fragment>
      <div css={css({ padding: '8px 10px 13px', textAlign: 'center', lineHeight: 1.3 })}>
        Your were invited to join <b>{group.name}</b>. To collaborate on it with peers, you will need to add{' '}
        {group.num_papers} papers to your library.
      </div>
      <div
        css={css`
          ${presets.row};
          justify-content: space-around;
        `}
      >
        <Button
          onClick={() => {
            joinGroup();
            toast.dismiss(toastId);
          }}
          color="primary"
          variant="outlined"
          css={buttonCss}
        >
          Yes, join list
        </Button>
        <Button color="secondary" variant="outlined" css={buttonCss} onClick={() => toast.dismiss(toastId)}>
          No, thanks
        </Button>
      </div>
    </React.Fragment>,
  );
};
