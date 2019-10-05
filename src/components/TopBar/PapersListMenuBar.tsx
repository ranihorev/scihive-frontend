/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem/index';
import Button from '@material-ui/core/Button';
import { simpleLink } from '../../utils/presets';

export const PaperListDekstopMenu = () => {
  return (
    <React.Fragment>
      <Button color="inherit">
        <a
          href="http://www.tricider.com/brainstorming/2urLxQ6t9XR"
          target="_blank"
          rel="noopener noreferrer"
          css={simpleLink}
        >
          Suggest a Feature
        </a>
      </Button>
    </React.Fragment>
  );
};
export const PaperListMobileMenu: React.FC<{ handleMobileMenuClick?: () => void }> = ({
  handleMobileMenuClick = () => {},
}) => {
  return (
    <React.Fragment>
      <a
        href="http://www.tricider.com/brainstorming/2urLxQ6t9XR"
        css={simpleLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleMobileMenuClick()}
      >
        <MenuItem>Suggest a feature</MenuItem>
      </a>
    </React.Fragment>
  );
};
