/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem/index';
import Menu from '@material-ui/core/Menu/index';
import { withRouter } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import Bookmark from '../Bookmark';
import { actions } from '../../actions';
import { simpleLink } from '../../utils/presets';

const PaperMenuDekstopRender = ({ match: { params }, toggleGroupsModal, isLoggedIn }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const { PaperId } = params;

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Bookmark paperId={PaperId} color="white" />
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <i
          className="fas fa-link"
          css={css`
            font-size: 17px;
            padding: 0 2px;
          `}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
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
      </Menu>
      {isLoggedIn ? (
        <IconButton color="inherit" onClick={toggleGroupsModal}>
          <i
            className="fas fa-users"
            css={css`
              font-size: 18px;
            `}
          />
        </IconButton>
      ) : null}
    </React.Fragment>
  );
};

const PaperMenuMobileRender = ({ match: { params }, handleMobileMenuClick, toggleGroupsModal, isLoggedIn }) => {
  const { PaperId } = params;

  return (
    <React.Fragment>
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
      {isLoggedIn ? (
        <MenuItem
          onClick={() => {
            handleMobileMenuClick();
            toggleGroupsModal();
          }}
        >
          Groups
        </MenuItem>
      ) : null}
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleGroupsModal: () => {
      dispatch(actions.toggleGroupsModal());
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export const PaperDekstopMenu = withRedux(withRouter(PaperMenuDekstopRender));

export const PaperMobileMenu = withRedux(withRouter(PaperMenuMobileRender));
