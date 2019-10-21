/** @jsx jsx */
import React from 'react';
import { connect } from 'react-redux';
import * as queryString from 'query-string';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { PaperListRouterParams } from '../models';
import { loadGroups as loadGroupsThunk } from '../thunks';
interface GroupJoinerDispatchProps {
  loadGroups: (...args: Parameters<typeof loadGroupsThunk>) => void;
}

interface GroupJoinerProps extends GroupJoinerDispatchProps {}

const GroupLoader: React.FC<GroupJoinerProps> = ({ loadGroups }) => {
  const history = useHistory();
  const location = useLocation();
  const match = matchPath<PaperListRouterParams>(history.location.pathname, {
    // You can share this string as a constant if you want
    path: '/list/:groupId',
  });

  React.useEffect(() => {
    const groupId = match ? match.params.groupId : undefined;
    const onSuccess = () => {
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({
          ...queryString.parse(location.search),
          newGroup: 1,
        }),
      });
    };
    loadGroups(groupId, onSuccess);
  }, [history, location]);

  return null;
};

const mapDispatchToProps = (dispatch: RTDispatch): GroupJoinerDispatchProps => {
  return {
    loadGroups: (groupId, onSuccess) => {
      dispatch(loadGroupsThunk(groupId, onSuccess));
    },
  };
};

const withRedux = connect(
  null,
  mapDispatchToProps,
);

export default withRedux(GroupLoader);
