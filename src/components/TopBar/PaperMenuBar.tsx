/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Divider, MenuItem, Popper, Paper, ClickAwayListener } from '@material-ui/core';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import useReactRouter from 'use-react-router';
import { CodeMeta, RootState } from '../../models';
import { simpleLink } from '../../utils/presets';
import Bookmark from '../Bookmark';
import { ButtonIcon } from '../ButtonIcon';
import { PopoverMenu } from '../PopoverMenu';

interface PaperMenuDekstopProps {
  isLoggedIn: boolean;
  codeMeta?: CodeMeta;
  selectedGroupIds: string[];
}

const PaperMenuDekstopRender: React.FC<PaperMenuDekstopProps> = ({ isLoggedIn, codeMeta, selectedGroupIds }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
      <Bookmark paperId={PaperId} color="white" selectedGroupIds={selectedGroupIds} size={23} type="single" />
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
  isLoggedIn: boolean;
  codeMeta?: CodeMeta;
}

const PaperMenuMobileRender: React.FC<PaperMenuMobileProps> = ({
  handleMobileMenuClick = () => {},
  isLoggedIn,
  codeMeta,
}) => {
  const {
    match: { params },
  } = useReactRouter();
  const { PaperId } = params;

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

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    codeMeta: state.paper.codeMeta,
    selectedGroupIds: state.paper.groupIds,
  };
};

const withRedux = connect(mapStateToProps);

export const PaperDekstopMenu = withRedux(PaperMenuDekstopRender);

export const PaperMobileMenu = withRedux(PaperMenuMobileRender);
