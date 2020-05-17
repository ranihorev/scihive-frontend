/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import GroupShare from '../Groups/GroupShare';

interface Props {
  isLibraryMode: boolean;
  authorId?: string;
  groupName?: string;
  groupId?: string;
}

export const Title: React.FC<Props> = ({ isLibraryMode, authorId, groupId, groupName }) => {
  if (!(isLibraryMode || authorId || groupId)) return null;
  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: `[name] max-content [share] max-content auto [collection] max-content`,
        alignItems: 'center',
        marginBottom: 5,
      }}
    >
      <Typography
        variant="h5"
        css={css({
          fontWeight: 700,
          marginRight: 5,
          paddingBottom: 1,
          gridColumn: 'name',
        })}
      >
        {isLibraryMode ? 'My Library' : authorId ? authorId : groupName}
      </Typography>
      {groupId && groupName && (
        <GroupShare iconSize={12} buttonSize="small" groupId={groupId} css={{ gridColumn: 'share' }} />
      )}
      {(
        <Button component={Link} to="/collections" color="primary" css={{ gridColumn: 'collection' }}>
          My Collections
        </Button>
      )}
    </div>
  );
};
