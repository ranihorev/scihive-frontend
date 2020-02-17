/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Divider, IconButton, MenuItem } from '@material-ui/core';
import ShareIcon from '@material-ui/icons/Share';
import copy from 'clipboard-copy';
import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../../stores/paper';
import { simpleLink } from '../../utils/presets';
import { ArrowTooltip } from '../ArrowTooltip';
import { ButtonIcon } from '../ButtonIcon';
import Bookmark from '../Groups/Bookmark';
import { PopoverMenu } from '../PopoverMenu';

const DEFAULT_SHARE_TEXT = 'Share paper';

export const PaperDekstopMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [shareText, setShareText] = React.useState(DEFAULT_SHARE_TEXT);
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);
  const {
    paperId,
    url,
    isEditable,
    codeMeta,
    groupIds,
    updatePaperGroups,
    updateBookmark,
    isBookmarked,
  } = usePaperStore(
    state =>
      pick(state, [
        'url',
        'paperId',
        'isEditable',
        'codeMeta',
        'groupIds',
        'updatePaperGroups',
        'updateBookmark',
        'isBookmarked',
      ]),
    shallow,
  );
  const isMenuOpen = Boolean(anchorEl);

  React.useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, []);

  const handleMenuOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // TODO: replace isEditable with proper metadata from the backend
  if (!paperId) return null;
  return (
    <React.Fragment>
      <ArrowTooltip title={shareText}>
        <IconButton
          onClick={() => {
            copy(`${window.location.origin}/paper/${paperId}/`);
            if (timeoutId.current) clearTimeout(timeoutId.current);
            setShareText('Link was copied to clipboard');
            setTimeout(() => {
              setShareText(DEFAULT_SHARE_TEXT);
            }, 2500);
          }}
        >
          <ShareIcon style={{ color: 'white' }} fontSize="small" />
        </IconButton>
      </ArrowTooltip>
      <Bookmark
        paperId={paperId}
        color="white"
        isBookmarked={isBookmarked}
        selectedGroupIds={groupIds}
        updatePaperGroup={updatePaperGroups}
        setBookmark={updateBookmark}
        size={23}
        type="single"
      />
      <IconButton size="small" onClick={handleMenuOpen} color="inherit">
        <i className="fas fa-link" css={{ fontSize: 16, padding: 7 }} />
      </IconButton>
      <PopoverMenu anchorEl={anchorEl} placement="bottom" open={isMenuOpen} onClose={handleMenuClose}>
        <div css={{ li: { fontSize: 14, minHeight: 40 } }}>
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
            href={isEditable ? url : `https://arxiv.org/pdf/${paperId}.pdf?download=1`} // download=1 ensures that the extension will ignore the link
            css={simpleLink}
            target="_blank"
            rel="noopener noreferrer"
            download={`${paperId}.pdf`}
          >
            <MenuItem onClick={handleMenuClose}>PDF</MenuItem>
          </a>
          {!isEditable && (
            <a
              href={`https://arxiv.org/abs/${paperId}`}
              css={simpleLink}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <MenuItem onClick={handleMenuClose}>Abstract</MenuItem>
            </a>
          )}
        </div>
      </PopoverMenu>
    </React.Fragment>
  );
};

export const PaperMobileMenu = () => {
  const { paperId, codeMeta, isEditable, url } = usePaperStore(
    state => pick(state, ['paperId', 'codeMeta', 'isEditable', 'url']),
    shallow,
  );

  const res = [
    <a
      key="pdf"
      href={isEditable ? url : `https://arxiv.org/pdf/${paperId}.pdf?download=1`}
      css={simpleLink}
      target="_blank"
      rel="noopener noreferrer"
      download={`${paperId}.pdf`}
    >
      <MenuItem>Download PDF</MenuItem>
    </a>,
  ];
  if (!isEditable) {
    res.push(
      <a
        key="latex"
        href={`https://arxiv.org/e-print/${paperId}`}
        css={simpleLink}
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <MenuItem>Download LaTeX</MenuItem>
      </a>,
    );
  }
  res.push(<Divider key="divider" />);
  if (codeMeta?.paperswithcode) {
    res.unshift(
      <a href={codeMeta.paperswithcode} css={simpleLink} target="_blank" rel="noopener noreferrer" key="code">
        <MenuItem>PapersWithCode</MenuItem>
      </a>,
    );
  }
  if (codeMeta?.github) {
    res.unshift(
      <a href={codeMeta.github} css={simpleLink} target="_blank" rel="noopener noreferrer" key="github">
        <MenuItem>Github</MenuItem>
      </a>,
    );
  }
  return res;
};
