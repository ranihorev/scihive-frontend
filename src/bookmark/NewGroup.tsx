/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Input, ListItem } from '@material-ui/core';
import React from 'react';

interface NewGroupProps {
  value: string;
  setValue: React.Dispatch<string>;
  submitGroup: () => void;
}

export const NewGroup: React.FC<NewGroupProps> = ({ value, setValue, submitGroup }) => {
  return (
    <ListItem css={{ paddingTop: 12 }}>
      <Input
        value={value}
        placeholder="Search or Create..."
        autoFocus
        onChange={e => {
          setValue(e.target.value);
        }}
        onKeyPress={e => {
          if (e.key === 'Enter') submitGroup();
        }}
        inputProps={{ style: { padding: '3px 0 4px' } }}
        fullWidth
      />
    </ListItem>
  );
};
