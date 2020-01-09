/** @jsx jsx */
import * as queryString from 'query-string';
import React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { PaperListRouterParams } from '../../models';
import { useUserStore } from '../../stores/user';

const GroupLoader: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const loadGroups = useUserStore(state => state.loadGroups);

  React.useEffect(() => {
    const match = matchPath<PaperListRouterParams>(history.location.pathname, {
      // You can share this string as a constant if you want
      path: '/list/:groupId',
    });
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
  }, [history, location, loadGroups]);

  return null;
};

export default GroupLoader;
