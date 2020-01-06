import axios from 'axios';
import create, { PartialState, State, StateCreator } from 'zustand';
import { devtools } from './devTools';

export type NamedSetState<T extends State> = (partial: PartialState<T>, name?: any) => void;

const log = (config: any) => (set: any, get: any, api: any) =>
  config(
    (args: any) => {
      console.log('  applying', args);
      set(args);
      console.log('  new state', get());
    },
    get,
    api,
  );

export const createWithDevtools = <T extends StateCreator<any>>(stateAndActions: T, storeName?: string) =>
  create<ReturnType<T>>(
    process.env.NODE_ENV === 'development' ? devtools(stateAndActions, storeName) : stateAndActions,
  );

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
