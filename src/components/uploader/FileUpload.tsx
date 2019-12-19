/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Axios from 'axios';
import { isEmpty } from 'lodash';
import React from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { FileMetadata } from '../../models';
import { Typography, LinearProgress } from '@material-ui/core';

type UploadStatus = 'idle' | 'uploading' | 'processing';

export const FileUpload: React.FC<{ setFileMeta: (meta: FileMetadata) => void }> = ({ setFileMeta }) => {
  const [uploadStatus, setUploadStatus] = React.useState<{ status: UploadStatus; prct: number }>({
    status: 'idle',
    prct: 0,
  });
  const onDrop = React.useCallback<Required<DropzoneOptions>['onDrop']>(
    acceptedFiles => {
      if (isEmpty(acceptedFiles)) {
        return;
      }
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      setUploadStatus({ status: 'uploading', prct: 0 });
      Axios.post('/new_paper/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          const prct = (100 * progressEvent.loaded) / progressEvent.total;
          setUploadStatus({ status: prct >= 100 ? 'processing' : 'uploading', prct: prct });
        },
      })
        .then(res => {
          setFileMeta(res.data);
        })
        .catch(err => {
          console.error(err.message);
          setUploadStatus({ status: 'idle', prct: 0 });
        });
    },
    [setFileMeta],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 3e7,
    accept: 'application/pdf',
    onDropRejected: (res, e) => console.log(e),
  });

  return (
    <div>
      {uploadStatus.status !== 'idle' ? (
        <React.Fragment>
          <Typography variant="body1" css={{ marginTop: 16 }}>
            {uploadStatus.status === 'processing' ? 'Processing...' : 'Uploading...'}
          </Typography>
          <LinearProgress
            variant={uploadStatus.status === 'uploading' ? 'determinate' : 'indeterminate'}
            value={uploadStatus.prct}
            css={{ marginTop: 8 }}
          />
        </React.Fragment>
      ) : (
        <div
          {...getRootProps()}
          css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            border-width: 2px;
            border-radius: 2px;
            border-color: ${isDragActive ? '#2196f3' : '#eeeeee'};
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
      )}
    </div>
  );
};
