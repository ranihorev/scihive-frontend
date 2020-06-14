/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Button, LinearProgress, TextField, Typography } from '@material-ui/core';
import Axios from 'axios';
import { isEmpty } from 'lodash';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { track } from '../Tracker';

type UploadStatus = 'idle' | 'uploading' | 'processing';

const Spacer: React.FC<{ size: number }> = ({ size }) => <div css={{ width: size, height: size }} />;

export const FileUpload: React.FC = () => {
  const history = useHistory();
  const [link, setLink] = React.useState('');
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
      track('uploadPaperNew', { type: 'file' });
      Axios.post<{ id: string }>('/new_paper/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          const prct = (100 * progressEvent.loaded) / progressEvent.total;
          setUploadStatus({ status: prct >= 100 ? 'processing' : 'uploading', prct: prct });
        },
      })
        .then(res => {
          history.push(`/paper/${res.data.id}?info=True`);
        })
        .catch(err => {
          console.error(err.message);
          setUploadStatus({ status: 'idle', prct: 0 });
        });
    },
    [history],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 3e7,
    accept: 'application/pdf',
    onDropRejected: (res, e) => console.log(e),
  });

  const onSubmitLink = () => {
    if (!link.endsWith('.pdf')) {
      toast.error('Only PDF links are supported, please try a different link');
      return;
    }
    track('uploadPaper', { type: 'link' });
    setUploadStatus({ status: 'processing', prct: 0 });
    Axios.post<{ id: string }>('/new_paper/add', { link })
      .then(res => {
        history.push(`/paper/${res.data.id}?info=True`);
      })
      .catch(err => {
        console.error(err.message);
        toast.error(`Failed to upload file - ${err.message}`);
        setUploadStatus({ status: 'idle', prct: 0 });
      });
  };

  return (
    <div css={{ border: `1px solid #ececec`, borderRadius: 5, width: '80%', maxWidth: 600, padding: 24 }}>
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
        <React.Fragment>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSubmitLink();
            }}
          >
            <div css={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TextField
                value={link}
                onChange={e => setLink(e.target.value)}
                type="url"
                placeholder="Paste URL or arXiv ID"
                fullWidth
                style={{ marginRight: 10 }}
                required
              />
              <Button type="submit" size="small" color="primary" variant="outlined">
                Upload
              </Button>
            </div>
          </form>
          <div css={{ padding: 15, display: 'flex', flexDirection: 'row', justifyContent: 'center', color: '#b5b5b5' }}>
            <i>- or -</i>
          </div>
          <div
            {...getRootProps()}
            css={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
              borderWidth: 2,
              borderRadius: 2,
              borderColor: isDragActive ? '#2196f3' : '#eeeeee',
              borderStyle: 'dashed',
              backgroundColor: '#fafafa',
              color: '#bdbdbd',
              outline: 'none',
              transition: 'border 0.24s ease-in-out',
              '&:focus': {
                borderColor: '#2196f3',
              },
            }}
          >
            <input {...getInputProps()} />
            <p>{isDragActive ? 'Drop file here...' : "Drag 'n' drop file here, or click to select"}</p>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export const Upload: React.FC = () => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100vw',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4">Which paper would you like to upload?</Typography>
      <Spacer size={24} />
      <FileUpload />
    </div>
  );
};
