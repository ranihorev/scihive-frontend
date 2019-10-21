import { isEmpty } from 'lodash';

export const getIsLoggedIn = (state: RootState) => !isEmpty(state.user.userData);

export const getGroups = (state: RootState) => state.user.groups;
