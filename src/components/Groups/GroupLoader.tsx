/** @jsx jsx */
import * as queryString from 'query-string';
import React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';

const GroupLoader: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const loadGroups = useUserStore(state => state.loadGroups);

  React.useEffect(() => {
    const match = matchPath<{ groupId?: string }>(history.location.pathname, {
      path: '/collection/:groupId',
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
