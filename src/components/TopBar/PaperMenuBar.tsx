/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Divider, MenuItem } from '@material-ui/core';
import { pick } from 'lodash';
import React, { useState } from 'react';
import useReactRouter from 'use-react-router';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../stores/paper';
import { simpleLink } from '../../utils/presets';
import { ButtonIcon } from '../ButtonIcon';
import Bookmark from '../Groups/Bookmark';
import { PopoverMenu } from '../PopoverMenu';

export const PaperDekstopMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { codeMeta, groupIds, updatePaperGroups, updateBookmark, isBookmarked } = usePaperStore(
    state => pick(state, ['codeMeta', 'groupIds', 'updatePaperGroups', 'updateBookmark', 'isBookmarked']),
    shallow,
  );
  const isMenuOpen = Boolean(anchorEl);
  const {
    match: { params },
  } = useReactRouter();
  const { PaperId } = params;

  const handleMenuOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Bookmark
        paperId={PaperId}
        color="white"
        isBookmarked={isBookmarked}
        selectedGroupIds={groupIds}
        updatePaperGroup={updatePaperGroups}
        setBookmark={updateBookmark}
        size={23}
        type="single"
      />
      <ButtonIcon icon="fas fa-link" size={22} iconSize={16} onClick={handleMenuOpen} />
      <PopoverMenu anchorEl={anchorEl} placement="bottom" open={isMenuOpen} onClose={handleMenuClose}>
        {codeMeta && codeMeta.github && (
          <a href={codeMeta.github} css={simpleLink} target="_blank" rel="noopener noreferrer">
            <MenuItem onClick={handleMenuClose}>Github</MenuItem>
          </a>
        )}
        {codeMeta && codeMeta.paperswithcode && (
          <a href={codeMeta.paperswithcode} css={simpleLink} target="_blank" rel="noopener noreferrer">
            <MenuItem onClick={handleMenuClose}>PapersWithCode</MenuItem>
          </a>
        )}
        <a
          href={`https://arxiv.org/pdf/${PaperId}.pdf?download=1`} // download=1 ensures that the extension will ignore the link
          css={simpleLink}
          target="_blank"
          rel="noopener noreferrer"
          download={`${PaperId}.pdf`}
        >
          <MenuItem onClick={handleMenuClose}>PDF</MenuItem>
        </a>
        <a
          href={`https://arxiv.org/abs/${PaperId}`}
          css={simpleLink}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <MenuItem onClick={handleMenuClose}>Abstract</MenuItem>
        </a>
      </PopoverMenu>
    </React.Fragment>
  );
};

interface PaperMenuMobileProps {
  handleMobileMenuClick?: () => void;
}

export const PaperMobileMenu: React.FC<PaperMenuMobileProps> = ({ handleMobileMenuClick = () => {} }) => {
  const {
    match: {
      params: { PaperId },
    },
  } = useReactRouter();

  const codeMeta = usePaperStore(state => state.codeMeta);

  return (
    <React.Fragment>
      {codeMeta && codeMeta.github && (
        <a href={codeMeta.github} css={simpleLink} target="_blank" rel="noopener noreferrer">
          <MenuItem onClick={() => handleMobileMenuClick()}>Github</MenuItem>
        </a>
      )}
      {codeMeta && codeMeta.paperswithcode && (
        <a href={codeMeta.paperswithcode} css={simpleLink} target="_blank" rel="noopener noreferrer">
          <MenuItem onClick={() => handleMobileMenuClick()}>PapersWithCode</MenuItem>
        </a>
      )}
      <a
        href={`https://arxiv.org/pdf/${PaperId}.pdf?download=1`}
        css={simpleLink}
        target="_blank"
        rel="noopener noreferrer"
        download={`${PaperId}.pdf`}
        onClick={() => handleMobileMenuClick()}
      >
        <MenuItem>Download PDF</MenuItem>
      </a>
      <a
        href={`https://arxiv.org/e-print/${PaperId}`}
        css={simpleLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleMobileMenuClick()}
        download
      >
        <MenuItem>Download LaTeX</MenuItem>
      </a>
      <Divider />
    </React.Fragment>
  );
};
