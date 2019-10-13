import { isEmpty } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import useReactRouter from 'use-react-router';
import { Group } from '../models';
import { joinGroup as joinGroupThunk, loadGroups as loadGroupsThunk } from '../thunks';

interface GroupJoinerDispatchProps {
  loadGroups: (onSuccess: (groups: Group[]) => void) => void;
  joinGroup: (groupId: string, onSuccess: (group: Group) => void, onFail: () => void) => void;
}

interface GroupJoinerProps extends GroupJoinerDispatchProps {
  isLoggedIn: boolean;
  groups: Group[];
}

const GroupLoader: React.FC<GroupJoinerProps> = ({ isLoggedIn, groups, loadGroups, joinGroup }) => {
  const { location } = useReactRouter();
  const groupLoaded = React.useRef(false);

  const onLoadGroups = React.useCallback(
    (groups: Group[]) => {
      const params = queryString.parse(location.search);
      if (params.group && !groups.some(g => g.id === params.group)) {
        joinGroup(
          params.group as string,
          group => {
            toast.info(
              <span>
                You were added to <b>{group.name}</b>!
              </span>,
              { autoClose: 4000 },
            );
          },
          () => {
            toast.error('List does not exist');
          },
        );
      }
    },
    [location.search, groups],
  );

  React.useEffect(() => {
    if (isLoggedIn && !groupLoaded.current) {
      loadGroups(onLoadGroups);
      groupLoaded.current = true;
    }
  }, [isLoggedIn]);
  return null;
};

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
    groups: state.user.groups,
  };
};

const mapDispatchToProps = (dispatch: RTDispatch): GroupJoinerDispatchProps => {
  return {
    loadGroups: onSuccess => {
      dispatch(loadGroupsThunk(onSuccess));
    },
    joinGroup: (...args) => {
      dispatch(joinGroupThunk(...args));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(GroupLoader);
