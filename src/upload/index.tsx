/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button, LinearProgress, TextField, Typography } from '@material-ui/core';
import Axios from 'axios';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import Helmet from 'react-helmet';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import baseStyles from '../base.module.scss';
import { TopBar, TopBarButton } from '../topBar';
import { track } from '../Tracker';
import { useQueryUploadLink } from '../utils/hooks';
import { Spacer } from '../utils/Spacer';
import styles from './styles.module.scss';
import { useLatestCallback } from '../utils/useLatestCallback';

type UploadStatus = 'idle' | 'uploading' | 'processing';

const getPaperPath = (paperId: string) => `/paper/${paperId}`;

export const FileUpload: React.FC = () => {
  const history = useHistory();
  const providedUploadLink = useQueryUploadLink();
  const [link, setLink] = React.useState(providedUploadLink);
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
          setUploadStatus({ status: 'uploading', prct: prct });
        },
      })
        .then(res => {
          history.push(getPaperPath(res.data.id));
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

  const onSubmitLink = useLatestCallback(() => {
    track('uploadPaper', { type: 'link' });
    setUploadStatus({ status: 'processing', prct: 0 });
    Axios.post<{ id: string }>('/new_paper/add', { link })
      .then(res => {
        history.push(getPaperPath(res.data.id));
      })
      .catch(err => {
        console.error(err.message);
        toast.error(`Failed to upload file - ${err.message}`);
        setUploadStatus({ status: 'idle', prct: 0 });
      });
  });

  React.useEffect(() => {
    if (!providedUploadLink) return;
    onSubmitLink();
  }, [providedUploadLink, onSubmitLink]);

  return (
    <div className={baseStyles.screenCentered}>
      <div className={styles.uploadRoot}>
        <Typography variant="h4">Upload paper</Typography>
        <Spacer size={24} />

        {uploadStatus.status !== 'idle' ? (
          <React.Fragment>
            <Spacer size={16} />
            <Typography variant="body1">
              {uploadStatus.status === 'processing' ? 'Processing...' : 'Uploading...'}
            </Typography>
            <Spacer size={8} />
            <LinearProgress
              variant={uploadStatus.status === 'uploading' ? 'determinate' : 'indeterminate'}
              value={uploadStatus.prct}
            />
            <Spacer size={16} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <form
              onSubmit={e => {
                e.preventDefault();
                onSubmitLink();
              }}
            >
              <div className={styles.fileUrl}>
                <TextField
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  type="url"
                  placeholder="Paste URL"
                  fullWidth
                  required
                />
                <Spacer size={12} />
                <Button type="submit" size="small" color="primary" variant="outlined">
                  Upload
                </Button>
              </div>
            </form>
            <div
              css={{ padding: 15, display: 'flex', flexDirection: 'row', justifyContent: 'center', color: '#b5b5b5' }}
            >
              <i>- or -</i>
            </div>
            <div {...getRootProps()} className={cx(styles.dragDrop, { [styles.active]: isDragActive })}>
              <input {...getInputProps()} />
              <p>{isDragActive ? 'Drop file here...' : "Drag 'n' drop file here, or click to select"}</p>
            </div>
            <Typography variant="body2" className="mt-6 text-gray-600">
              Please recall that some scientific papers have copyrights. SciHive takes no responsibility for the content
              you upload. You should do it at your own risk.
            </Typography>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export const Upload: React.FC = () => {
  return (
    <div className={baseStyles.fullScreen}>
      <Helmet>
        <title>Upload Paper</title>
      </Helmet>
      <TopBar rightMenu={<TopBarButton to="/library">Library</TopBarButton>} />
      <FileUpload />
    </div>
  );
};
