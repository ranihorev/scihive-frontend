/** @jsx jsx */
import React from 'react';
import { connect } from 'react-redux';
import { matchPath, useHistory } from 'react-router-dom';
import { PaperListRouterParams } from '../models';
import { loadGroups as loadGroupsThunk } from '../thunks';
interface GroupJoinerDispatchProps {
  loadGroups: (groupId?: string) => void;
}

interface GroupJoinerProps extends GroupJoinerDispatchProps {}

const GroupLoader: React.FC<GroupJoinerProps> = ({ loadGroups }) => {
  const history = useHistory();
  const match = matchPath<PaperListRouterParams>(history.location.pathname, {
    // You can share this string as a constant if you want
    path: '/list/:groupId',
  });

  React.useEffect(() => {
    const groupId = match ? match.params.groupId : undefined;
    loadGroups(groupId);
  }, []);

  return null;
};

const mapDispatchToProps = (dispatch: RTDispatch): GroupJoinerDispatchProps => {
  return {
    loadGroups: onSuccess => {
      dispatch(loadGroupsThunk(onSuccess));
    },
  };
};

const withRedux = connect(
  null,
  mapDispatchToProps,
);

export default withRedux(GroupLoader);
