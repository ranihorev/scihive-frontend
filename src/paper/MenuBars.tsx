import { Button, IconButton } from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Bookmark } from '../bookmark';
import { usePaperStore } from '../stores/paper';
import { useUserStore } from '../stores/user';
import { TopBar } from '../topBar';
import { addOrRemovePaperToGroupRequest, addRemoveGroupFromPaperCache, OnSelectGroupProps } from '../utils/useGroups';
import { useProtectedFunc } from '../utils/useProtectFunc';
import { Sidebar } from './sideBar';
import MenuIcon from '@material-ui/icons/Menu';
import { Spacer } from '../utils/Spacer';

const GROUPS_Q = 'paper_groups';

interface GroupIds {
  groups: string[];
}

const PaperBookmark: React.FC<{ paperId: string }> = ({ paperId }) => {
  const isLoggedIn = useUserStore(state => state.status === 'loggedIn');
  const { data, isSuccess } = useQuery(
    GROUPS_Q,
    async () => {
      const response = await axios.get<GroupIds>(`/paper/${paperId}/groups`);
      return response.data;
    },
    { enabled: isLoggedIn },
  );

  const [onSelectGroup] = useMutation(
    async (props: OnSelectGroupProps) => {
      return addOrRemovePaperToGroupRequest({ paperId, ...props });
    },
    {
      onMutate: ({ shouldAdd, groupId }) => {
        addRemoveGroupFromPaperCache({ groupId, queryKey: GROUPS_Q, shouldAdd });

        return () => {
          return addRemoveGroupFromPaperCache({ groupId, queryKey: GROUPS_Q, shouldAdd: !shouldAdd });
        };
      },
      onError: (err, props, rollback: () => void) => {
        rollback();
        toast.error('Failed to update collection');
      },
      onSettled: () => {
        queryCache.invalidateQueries(GROUPS_Q);
      },
    },
  );

  if (!isSuccess) return null;

  return (
    <Bookmark
      color="white"
      type="single"
      paperId={paperId}
      size={20}
      selectedGroupIds={data?.groups || []}
      onSelectGroup={props => {
        onSelectGroup(props);
      }}
    />
  );
};

export const MenuBars: React.FC<{ paperId: string }> = ({ paperId }) => {
  const { protectFunc } = useProtectedFunc();
  const setIsInviteOpen = usePaperStore(state => state.setIsInviteOpen);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TopBar
        rightMenu={
          <React.Fragment>
            <PaperBookmark paperId={paperId} />
            <Button color="inherit" onClick={() => protectFunc(() => setIsInviteOpen(true))}>
              Share
            </Button>
          </React.Fragment>
        }
        leftElement={
          <React.Fragment>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => {
                setIsDrawerOpen(state => !state);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Spacer size={8} />
          </React.Fragment>
        }
      />
      <Sidebar {...{ isDrawerOpen, setIsDrawerOpen }} />
    </React.Fragment>
  );
};
