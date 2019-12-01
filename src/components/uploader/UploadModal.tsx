/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Fade, Modal } from '@material-ui/core';
import React from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { presets } from '../../utils';
import Axios from 'axios';
import { isEmpty } from 'lodash';

interface Author {
  first_name: string;
  last_name: string;
}

interface FileMetadata {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
}

const FileUpload: React.FC<{ setFileMeta: (meta: FileMetadata) => void }> = ({ setFileMeta }) => {
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

export const UploadModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = React.memo(
  ({ isOpen, closeModal }) => {
    const [fileMeta, setFileMeta] = React.useState<FileMetadata | undefined>();
    console.log(fileMeta);
    return (
      <Modal open={isOpen} onClose={closeModal}>
        <Fade in={isOpen}>
          <div css={presets.modalCss}>{!fileMeta ? <FileUpload setFileMeta={setFileMeta} /> : <div>Loaded</div>}</div>
        </Fade>
      </Modal>
    );
  },
);
