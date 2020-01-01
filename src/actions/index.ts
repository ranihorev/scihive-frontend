import { actions as papersListActions } from './papersList';
import { actions as paperActions } from './paper';

export const actions = {
  ...paperActions,
  ...papersListActions,
} as const;

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
