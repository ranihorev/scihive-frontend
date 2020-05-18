/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FormControl, Input, MenuItem, Select } from '@material-ui/core';
import React from 'react';
import { formControlCss } from './utils';
import { useLocation, useHistory } from 'react-router';
import { Group } from '../../models';

const filterValueCss = css`
  font-size: 13px;
`;

const filterMenuItemCss = css`
  font-size: 13px;
  padding: 8px 12px;
`;

export type FilterEvent = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => void;

interface SortControlProps {
  onChange: FilterEvent;
  sort: string;
  hasSearchQuery: boolean;
  isLibraryOrList: boolean;
}

export const SortControl: React.FC<SortControlProps> = ({ onChange, sort, hasSearchQuery, isLibraryOrList }) => {
  return (
    <FormControl css={formControlCss}>
      <Select
        value={sort}
        onChange={e => onChange(e)}
        input={<Input name="sort" id="sort-helper" />}
        css={filterValueCss}
      >
        <MenuItem css={filterMenuItemCss} value="date">
          Date
        </MenuItem>
        {/* <MenuItem value="comments">Comments</MenuItem> */}
        <MenuItem css={filterMenuItemCss} value="tweets">
          Tweets
        </MenuItem>
        <MenuItem css={filterMenuItemCss} value="bookmarks">
          Stars
        </MenuItem>
        {hasSearchQuery && (
          <MenuItem css={filterMenuItemCss} value="score">
            Relevance
          </MenuItem>
        )}
        {isLibraryOrList && (
          <MenuItem css={filterMenuItemCss} value="date_added">
            Date added
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

interface TimeFilterProps {
  age: string;
  onChange: FilterEvent;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ age, onChange }) => {
  return (
    <FormControl css={formControlCss}>
      <Select value={age} onChange={onChange} input={<Input name="age" id="filter-helper" />} css={filterValueCss}>
        <MenuItem css={filterMenuItemCss} value="day">
          Today
        </MenuItem>
        <MenuItem css={filterMenuItemCss} value="week">
          This week
        </MenuItem>
        <MenuItem css={filterMenuItemCss} value="month">
          This month
        </MenuItem>
        <MenuItem css={filterMenuItemCss} value="all">
          All times
        </MenuItem>
      </Select>
    </FormControl>
  );
};

interface GroupFilterEvent {
  groupId?: string;
  groups: Group[];
}

const ALL_COLLECTIONS = 'All collections';

export const GroupFilter: React.FC<GroupFilterEvent> = ({ groupId, groups }) => {
  const location = useLocation();
  const history = useHistory();
  return (
    <FormControl css={formControlCss}>
      <Select
        value={groupId || ALL_COLLECTIONS}
        onChange={e => {
          history.push({
            pathname: e.target.value === ALL_COLLECTIONS ? '/library' : `/collection/${e.target.value}`,
            search: location.search,
          });
        }}
        input={<Input name="group" id="group-helper" />}
        css={filterValueCss}
      >
        <MenuItem css={filterMenuItemCss} value={ALL_COLLECTIONS}>
          All collections
        </MenuItem>
        {groups.map(group => (
          <MenuItem css={filterMenuItemCss} value={group.id} key={group.id}>
            <div
              css={css`
                max-width: 200px;
                overflow-x: hidden;
                text-overflow: ellipsis;
              `}
            >
              {group.name}
            </div>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
