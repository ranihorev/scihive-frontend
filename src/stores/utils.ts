import axios from 'axios';
import create, { PartialState, State, StateCreator, StoreApi, GetState } from 'zustand';
import { devtools } from 'zustand/middleware';
import { track } from '../Tracker';

export type NamedSetState<T extends State> = (partial: PartialState<T>, name?: any) => void;
type NamedStateCreator<T extends State> = (set: NamedSetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

export const withTrack = <T extends State>(fn: StateCreator<T>): NamedStateCreator<T> => (set, get, api) => {
  return fn(
    (state, name?: string) => {
      if (name) {
        track(name, typeof state === 'object' ? state : {});
      }
      set(state, name);
    },
    get,
    api,
  );
};

export const createWithDevtools = <T extends StateCreator<any>>(stateAndActions: T, storeName?: string) => {
  const actionsWithTrack = withTrack(stateAndActions);
  const withDevTools =
    process.env.NODE_ENV === 'development' ? devtools(actionsWithTrack, storeName) : actionsWithTrack;
  return create<ReturnType<T>>(withDevTools);
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
