import axios from 'axios';
import { useQuery, useMutation, queryCache } from 'react-query';
import { Group, PaperListResponse } from '../../models';
import { GroupColor } from '../../utils/presets';
import React from 'react';
import { QueryContext } from './QueryContext';

const FETCH_GROUPS_Q = 'fetchGroups';

export const useUpdatePaperGroupsCache = () => {
  const queryContext = React.useContext(QueryContext);
  const updateGroups = (paperId: string, groupIds: string[]) => {
    queryCache.setQueryData<PaperListResponse[]>(['papers', queryContext.query], oldData => {
      oldData?.forEach(batch => {
        batch.papers.forEach(currentPaper => {
          if (paperId === currentPaper.id) {
            currentPaper.groups = groupIds;
          }
          return oldData;
        });
      });
      return oldData || [];
    });
  };
  return updateGroups;
};

export const useFetchGroups = () => {
  const { data } = useQuery(
    FETCH_GROUPS_Q,
    async () => {
      const response = await axios.get<Group[]>('/groups/all');
      return response.data;
    },
    { cacheTime: 60000, refetchOnMount: false, refetchOnWindowFocus: false },
  );
  const groups = data || [];
  return groups;
};

export const useCreateGroup = () => {
  const createGroup = useMutation(
    async ({ name, color, paperId }: { name: string; color?: GroupColor; paperId?: string }) => {
      // TODO: handle errors
      const response = await axios.post<{ groups: Group[]; new_id: string }>('/groups/new', {
        name,
        color,
        paper_id: paperId,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(FETCH_GROUPS_Q);
      },
    },
  );
  return createGroup;
};

export interface AddRemovePaperToGroup {
  paperId: string;
  shouldAdd: boolean;
  groupId: string;
}

export const useAddOrRemovePaperToGroup = () => {
  const [submitRequest] = useMutation(async ({ paperId, groupId, shouldAdd }: AddRemovePaperToGroup) => {
    const response = await axios.post<Group[]>(`/groups/group/${groupId}`, {
      paper_id: paperId,
      add: shouldAdd,
    });
    return response.data;
  });
  return submitRequest;
};

export const useEditGroup = () => {
  const [submitRequest] = useMutation(
    async ({ groupId, ...payload }: { groupId: string; name?: string; color?: GroupColor }) => {
      return axios.patch<Group[]>(`/groups/group/${groupId}`, payload);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(FETCH_GROUPS_Q);
      },
    },
  );
  return submitRequest;
};

export const useDeleteGroup = () => {
  const [submitRequest] = useMutation(
    async (groupId: string) => {
      return axios.delete(`/groups/group/${groupId}`);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(FETCH_GROUPS_Q);
      },
    },
  );
  return submitRequest;
};
