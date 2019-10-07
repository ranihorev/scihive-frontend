import { actions as userActions } from './user';
import { actions as papersListActions } from './papersList';
import { actions as paperActions } from './paper';

export const actions = {
  ...paperActions,
  ...userActions,
  ...papersListActions,
} as const;

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
