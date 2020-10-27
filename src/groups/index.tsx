import { Button, List, TextField, Typography } from '@material-ui/core';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';
import { toast } from 'react-toastify';
import baseStyles from '../base.module.scss';
import { DetailedGroup } from '../models';
import { TopBar, TopBarButton } from '../topBar';
import { filterGroups } from '../utils';
import { pickRandomColor } from '../utils/presets';
import { Spacer } from '../utils/Spacer';
import { useCreateGroup, useFetchGroups } from '../utils/useGroups';
import { GroupRender } from './Group';
import styles from './styles.module.scss';
import { itemPadding } from './utils';

const TitleColumn: React.FC<{ className?: string }> = ({ className, children }) => {
  return <Typography className={cx(className, 'font-semibold text-gray-600 tracking-wide')}>{children}</Typography>;
};

const TableTitle: React.FC = () => {
  return (
    <div className={cx(styles.baseRow, styles.titleRow, itemPadding, 'bg-gray-300 items-center rounded-t')}>
      <TitleColumn className={styles.name}>Name</TitleColumn>
      <TitleColumn className={styles.date}>Created</TitleColumn>
      <TitleColumn className={styles.numPapers}># Papers</TitleColumn>
    </div>
  );
};

const GroupsList: React.FC = () => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const { groups, isLoading: isFetchingGroups } = useFetchGroups<DetailedGroup>(true);
  const [createNewGroup, { isLoading: isCreatingGroup }] = useCreateGroup();
  const formRef = React.useRef<HTMLFormElement>(null);
  const handleSubmitNewGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (groups.some(group => group.name.toLowerCase() === newGroupName.toLowerCase())) {
      toast.error('Collection with an identical name already exists');
      return;
    }
    await createNewGroup({ name: newGroupName, color: pickRandomColor() });
    setNewGroupName('');
  };

  const matchingGroups = filterGroups(groups, newGroupName);

  const noGroupsYet = !isFetchingGroups && isEmpty(groups);
  const noMatchingResults = !isFetchingGroups && !isEmpty(groups) && Boolean(newGroupName) && isEmpty(matchingGroups);

  return (
    <div className="pt-8 pb-4">
      <form onSubmit={handleSubmitNewGroup} className={cx(itemPadding, 'pb-4 flex flex-row')} ref={formRef}>
        <TextField
          type="text"
          name="name"
          placeholder="Search or create collection"
          className="w-full"
          variant="outlined"
          size="small"
          value={newGroupName}
          onChange={event => setNewGroupName(event.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.target.dispatchEvent(new Event('submit'));
            }
          }}
          required
          autoComplete="off"
        />
        <Spacer size={12} />
        <Button
          type="submit"
          variant="contained"
          className="w-24 md:w-32"
          color="primary"
          size="small"
          disabled={isCreatingGroup}
        >
          Create
        </Button>
      </form>
      <List>
        {noGroupsYet || noMatchingResults ? (
          <Typography color="textSecondary" className={itemPadding}>
            {noGroupsYet ? (
              <React.Fragment>
                You are about to create your first collection. That&apos;s awesome{' '}
                <span role="img" aria-label="excited">
                  🤩
                </span>
              </React.Fragment>
            ) : (
              `No matching collections. Press enter to create a new collection - ${newGroupName}`
            )}
          </Typography>
        ) : (
          <React.Fragment>
            <TableTitle />
            {matchingGroups.map(group => (
              <GroupRender key={group.id} group={group} />
            ))}
          </React.Fragment>
        )}
      </List>
    </div>
  );
};

const Groups: React.FC = () => {
  return (
    <div className={cx(baseStyles.fullScreen, 'bg-gray-100')}>
      <TopBar rightMenu={<TopBarButton to="/library">Library</TopBarButton>} />
      <div className="flex flex-col justify-center self-center mt-8 w-full md:w-4/5 max-w-screen-md px-4">
        <Typography variant="h4">My Collections</Typography>
        <Typography color="textSecondary" className="mt-2">
          Collections allow you to organize papers and share comments with groups of peers.
        </Typography>
        <div className="flex flex-col w-full rounded overflow-hidden bg-white mt-8 shadow">
          <GroupsList />
        </div>
      </div>
    </div>
  );
};

export default Groups;
