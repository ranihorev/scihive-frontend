/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Axios from 'axios';
import { isEmpty } from 'lodash';
import React from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { FileMetadata } from './models';

export const FileUpload: React.FC<{ setFileMeta: (meta: FileMetadata) => void }> = ({ setFileMeta }) => {
  const onDrop = React.useCallback<Required<DropzoneOptions>['onDrop']>(acceptedFiles => {
    if (isEmpty(acceptedFiles)) {
      return;
    }
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    Axios.post('/new_paper/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => {
        setFileMeta(res.data);
      })
      .catch(res => {
        console.log(res.message);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 3e7,
    accept: 'application/pdf',
    onDropRejected: (res, e) => console.log(e),
  });

  return (
    <div
      {...getRootProps()}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border-width: 2px;
        border-radius: 2px;
        border-color: #eeeeee;
        border-style: dashed;
        background-color: #fafafa;
        color: #bdbdbd;
        outline: none;
        transition: border 0.24s ease-in-out;
        &:focus {
          border-color: #2196f3;
        }
      `}
    >
      <input {...getInputProps()} />
      <p>{isDragActive ? 'Drop file here...' : "Drag 'n' drop file here, or click to select"}</p>
    </div>
  );
};
