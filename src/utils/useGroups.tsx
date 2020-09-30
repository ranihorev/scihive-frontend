import axios from 'axios';
import { queryCache, QueryKey, useMutation, useQuery } from 'react-query';
import { Group, PaperListResponse } from '../models';
import { GroupColor } from '../utils/presets';

const FETCH_GROUPS_Q = 'fetchGroups';

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

export interface OnSelectGroupProps {
  shouldAdd: boolean;
  groupId: string;
}

export interface AddRemovePaperToGroup extends OnSelectGroupProps {
  paperId: string;
}

export const addOrRemovePaperToGroupRequest = async ({ groupId, paperId, shouldAdd }: AddRemovePaperToGroup) => {
  const response = await axios.post<Group[]>(`/groups/group/${groupId}`, {
    paper_id: paperId,
    add: shouldAdd,
  });
  return response.data;
};

export const addOrRemoveToList = ({ groups, shouldAdd, groupId }: OnSelectGroupProps & { groups: string[] }) => {
  return shouldAdd ? [...groups, groupId] : groups.filter(g => g !== groupId);
};

export const addRemoveGroupFromPapersListCache = ({
  queryKey,
  shouldAdd,
  paperId,
  groupId,
}: {
  queryKey: QueryKey;
  shouldAdd: boolean;
  paperId: string;
  groupId: string;
}) => {
  queryCache.setQueryData<PaperListResponse[]>(queryKey, oldData => {
    oldData?.forEach(batch => {
      batch.papers.forEach(currentPaper => {
        if (paperId === currentPaper.id) {
          currentPaper.groups = addOrRemoveToList({ groups: currentPaper.groups, groupId, shouldAdd });
        }
        return oldData;
      });
    });
    return oldData || [];
  });
};

export const addRemoveGroupFromPaperCache = ({
  queryKey,
  shouldAdd,
  groupId,
}: {
  queryKey: QueryKey;
  shouldAdd: boolean;
  groupId: string;
}) => {
  queryCache.setQueryData<{ groups: string[] }>(queryKey, oldData => {
    if (!oldData) return { groups: [] };
    return { groups: addOrRemoveToList({ groups: oldData.groups, groupId, shouldAdd }) };
  });
};
