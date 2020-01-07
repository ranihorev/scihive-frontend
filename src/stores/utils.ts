import axios from 'axios';
import create, { PartialState, State, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { track } from '../Tracker';

export type NamedSetState<T extends State> = (partial: PartialState<T>, name?: any) => void;

export const log = <T extends State>(fn: StateCreator<T>): StateCreator<T> => (set, get, api) => {
  return fn(
    (state, name?: string) => {
      if (name) {
        track(name, typeof state === 'object' ? state : {});
      }
      set(state);
    },
    get,
    api,
  );
};

export const createWithDevtools = <T extends StateCreator<any>>(stateAndActions: T, storeName?: string) => {
  const stateAndActionsWithLog = log(stateAndActions);
  return create<ReturnType<T>>(
    process.env.NODE_ENV === 'development' ? devtools(stateAndActionsWithLog, storeName) : stateAndActionsWithLog,
  );
};

export interface AddRemovePaperToGroup {
  paperId: string;
  shouldAdd: boolean;
  groupId: string;
}

export const addRemovePaperToGroupHelper = async ({ paperId, groupId, shouldAdd }: AddRemovePaperToGroup) => {
  return axios.post(`/groups/group/${groupId}`, { paper_id: paperId, add: Number(shouldAdd) });
};

export interface AddRemoveBookmark {
  paperId: string;
  checked: boolean;
}

export const addRemoveBookmarkHelper = async (payload: AddRemoveBookmark) => {
  return await axios.post(`/library/${payload.paperId}/${payload.checked ? 'save' : 'remove'}`);
};
