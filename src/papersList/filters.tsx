/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FormControl, IconButton, IconButtonProps, MenuItem, TextField } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { PopoverMenu } from '../utils/PopoverMenu';
import { PapersListRequestParams } from '../models';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';

interface SortControlProps {
  onChange: (value: string) => void;
  sort?: string;
  hasSearchQuery: boolean;
  isLibrary?: boolean;
}

export const SortControl: React.FC<SortControlProps> = ({ onChange, sort, hasSearchQuery, isLibrary }) => {
  return (
    <FormControl className={styles.filterField}>
      <TextField select value={sort} onChange={e => onChange(e.target.value as string)} label="Sort By">
        <MenuItem value="date">Date</MenuItem>
        <MenuItem value="tweets">Tweets</MenuItem>
        <MenuItem value="bookmarks">Stars</MenuItem>
        {hasSearchQuery && <MenuItem value="score">Relevance</MenuItem>}
        {isLibrary && <MenuItem value="date_added">Date added</MenuItem>}
      </TextField>
    </FormControl>
  );
};

export const TimeFilter: React.FC<{ age?: string; onChange: (value: string) => void }> = ({ age, onChange }) => {
  return (
    <FormControl className={styles.filterField}>
      <TextField select value={age} onChange={e => onChange(e.target.value as string)} label="Published At">
        <MenuItem value="day">Today</MenuItem>
        <MenuItem value="week">This week</MenuItem>
        <MenuItem value="month">This month</MenuItem>
        <MenuItem value="all">All times</MenuItem>
      </TextField>
    </FormControl>
  );
};

interface FilterProps {
  requestParams: Partial<PapersListRequestParams>;
  updateQueryParams: (key: keyof PapersListRequestParams, value: string | undefined) => void;
}

export const Filters: React.FC<FilterProps> = ({ requestParams, updateQueryParams }) => {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <React.Fragment>
      <IconButton ref={anchorRef} onClick={() => setIsOpen(true)}>
        <FilterListIcon fontSize="small" />
      </IconButton>

      <PopoverMenu
        anchorEl={anchorRef.current}
        open={isOpen}
        onClose={e => {
          setIsOpen(false);
        }}
        placement="bottom-end"
        className={styles.filtersMenu}
        mouseEvent="onMouseDown"
      >
        <TimeFilter
          age={requestParams.age}
          onChange={value => {
            updateQueryParams('age', value);
          }}
        />
        <Spacer size={16} />
        <SortControl
          sort={requestParams.sort}
          onChange={value => {
            updateQueryParams('sort', value);
          }}
          isLibrary={requestParams.library}
          hasSearchQuery={Boolean(requestParams.q)}
        />
      </PopoverMenu>
    </React.Fragment>
  );
};

export const SearchButton: React.FC<IconButtonProps> = props => {
  return (
    <IconButton {...props}>
      <SearchIcon fontSize="small" />
    </IconButton>
  );
};

export const SearchField: React.FC<FilterProps> = ({ requestParams, updateQueryParams }) => {
  const [isExpanded, setIsExpanded] = React.useState(Boolean(requestParams.q));
  const [value, setValue] = React.useState<string>(requestParams.q || '');
  const InputIcon = value ? ClearIcon : SearchIcon;
  const onChange = (value: string) => updateQueryParams('q', value);
  return (
    <div className={styles.searchFilter}>
      {isExpanded ? (
        <TextField
          variant="outlined"
          size="small"
          autoFocus
          placeholder="Search"
          value={value}
          onBlur={() => {
            if (!value) {
              setIsExpanded(false);
            }
          }}
          onChange={e => {
            setValue(e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onChange(value);
              if (!value) {
                setIsExpanded(false);
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => {
                  onChange('');
                  setIsExpanded(false);
                }}
              >
                <InputIcon fontSize="small" />
              </IconButton>
            ),
            classes: {
              root: styles.searchInputField,
            },
          }}
        />
      ) : (
        <SearchButton onClick={() => setIsExpanded(true)} />
      )}
    </div>
  );
};
