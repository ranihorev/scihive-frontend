/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { IconButton, Tooltip } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { isEmpty } from 'lodash';
import React from 'react';
import { PopoverMenu } from '../../components/PopoverMenu';
import { Group } from '../../models';
import { COLORS, smallIconPadding } from '../../utils/presets';
import { OnSelectGroupProps } from '../utils/useGroups';
import { EditGroup } from './EditGroup';
import { GroupsList } from './GroupsList';
import styles from './styles.module.scss';

interface BookmarkProps {
  onSelectGroup: (props: OnSelectGroupProps) => void;
  color?: string | undefined;
  size?: number;
  paperId: string;
  position?: 'right' | 'center' | 'left';
  selectedGroupIds: string[];
  type: 'single' | 'list';
  className?: string;
}

const hint =
  'Add paper to a collection. Collections allow you to organize papers and can be shared with collaborators.';

export const Bookmark: React.FC<BookmarkProps> = ({
  onSelectGroup,
  selectedGroupIds,
  paperId,
  color = COLORS.grey,
  size = 18,
  type,
  className,
}) => {
  // const { isLoggedIn, toggleLoginModal } = useUserStore(
  //   state => ({ toggleLoginModal: state.toggleLoginModal, isLoggedIn: Boolean(state.userData) }),
  //   shallow,
  // );
  const [isOpen, setIsOpen] = React.useState(false);
  const [groupInEdit, setGroupInEdit] = React.useState<Group | undefined>(undefined);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const onListsClick = (event: React.MouseEvent) => {
    // if (!isLoggedIn) {
    //   toggleLoginModal('Please log in to save manage lists and bookmarks');
    //   return;
    // }
    setIsOpen(true);
  };

  const Star = isEmpty(selectedGroupIds) ? StarBorderIcon : StarIcon;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: ${type === 'single' ? 'row-reverse' : 'column'};
      `}
      className={className}
    >
      <Tooltip title={hint} arrow enterDelay={500} enterNextDelay={500}>
        <IconButton onClick={onListsClick} buttonRef={anchorRef} size="small">
          <Star style={{ width: size, height: size, color, padding: smallIconPadding }} />
        </IconButton>
      </Tooltip>
      <div />
      <PopoverMenu
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        zIndex={9999}
        className={styles.bookmarkContentWrapper}
      >
        {groupInEdit ? (
          <EditGroup group={groupInEdit} onFinishEdit={() => setGroupInEdit(undefined)} />
        ) : (
          <GroupsList {...{ onSelectGroup, selectedGroupIds, setGroupInEdit, paperId }} />
        )}
      </PopoverMenu>
    </div>
  );
};
