/** @jsx jsx */
import { jsx } from '@emotion/core';
import { TextField } from '@material-ui/core';
import React from 'react';
import { FileMetadata } from './models';

const initArgs: FileMetadata = {
  id: 'dfsdfsdf',
  title: 'This is a great title for paper',
  abstract: 'This is a very very long summary of paper. This is a very very long summary of paper.',
  authors: [{ first_name: 'John', last_name: 'Bla' }, { first_name: 'Jim', last_name: 'Jones' }],
  date: new Date(),
};
export const MetadataEditor: React.FC = () => {
  const [metadata, setMetadata] = React.useState(initArgs);
  const setMetaDataHelper = <T extends keyof FileMetadata>(key: T, value: FileMetadata[T]) => {
    return setMetadata({ ...metadata, [key]: value });
  };
  return (
    <div>
      <TextField
        required
        id="title"
        label="Title"
        value={metadata.title}
        margin="normal"
        multiline
        rowsMax="3"
        css={{ width: '100%' }}
        onChange={e => {
          setMetaDataHelper('title', e.target.value);
        }}
      />
      <div>Authors</div>
      <TextField required id="title" label="Title" value="test" margin="normal" />
    </div>
  );
};
