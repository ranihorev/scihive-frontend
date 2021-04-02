/** @jsx jsx */
import MomentUtils from '@date-io/moment';
import { jsx } from '@emotion/core';
import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import EventIcon from '@material-ui/icons/Event';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import produce from 'immer';
import moment, { Moment } from 'moment';
import React from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import baseStyles from '../../base.module.scss';
import { FileMetadata } from '../../models';
import { usePaperStore } from '../../stores/paper';
import styles from './styles.module.scss';

interface FileMetadataInternal extends Omit<FileMetadata, 'date'> {
  date: Moment;
}

interface AllProps {
  onClose: () => void;
  onSubmit: (data: FileMetadata) => void;
  metadata: FileMetadata;
}

class UTCUtils extends MomentUtils {
  format = (value: Moment, formatString: string) => {
    return moment.utc(value).format(formatString);
  };
}

const Header: React.FC = ({ children }) => {
  return (
    <Typography variant="h6" css={{ fontSize: 16 }}>
      {children}
    </Typography>
  );
};

const MetadataEditorInternal: React.FC<AllProps> = ({ onSubmit, onClose, metadata: inputMetadata }) => {
  const [metadata, setMetadata] = React.useState<Required<FileMetadataInternal>>({
    ...inputMetadata,
    abstract: inputMetadata.abstract || '',
    title: inputMetadata.title || '',
    date: moment.utc(inputMetadata.date),
    removed_authors: [],
    doi: inputMetadata.doi || '',
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const newAuthorAdded = React.useRef(false);

  React.useEffect(() => {
    newAuthorAdded.current = false;
  }, [metadata.authors]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ ...metadata, date: metadata.date.toISOString() });
      }}
      className={styles.metadataForm}
    >
      {/* Title */}
      <div>
        <Header>Title</Header>
        <TextField
          required
          value={metadata.title}
          margin="dense"
          multiline
          fullWidth
          rowsMax="3"
          onChange={e => {
            setMetadata({ ...metadata, title: e.target.value });
          }}
        />
      </div>
      {/* Date */}
      <div>
        <Header>Date published</Header>
        <MuiPickersUtilsProvider utils={UTCUtils}>
          <KeyboardDatePicker
            disableToolbar
            disableFuture
            required
            rifmFormatter={inp => inp}
            variant="inline"
            format="MM/DD/YYYY"
            margin="dense"
            open={isDatePickerOpen}
            value={moment.utc(metadata.date)}
            onChange={(date, value) => {
              if (date === null) return;
              setMetadata({ ...metadata, date });
              setIsDatePickerOpen(false);
            }}
            KeyboardButtonProps={{
              onClickCapture: () => {
                setIsDatePickerOpen(true);
              },
              size: 'small',
              style: { padding: 6 },
              'aria-label': 'change date',
            }}
            keyboardIcon={<EventIcon fontSize="small" />}
            PopoverProps={{
              onClose: () => setIsDatePickerOpen(false),
            }}
          />
        </MuiPickersUtilsProvider>
      </div>
      {/* Title */}
      <div>
        <Header>DOI</Header>
        <TextField
          required
          value={metadata.doi}
          margin="dense"
          fullWidth
          onChange={e => {
            setMetadata({ ...metadata, doi: e.target.value });
          }}
        />
      </div>
      {/* Authors */}
      <div>
        <div className={baseStyles.centeredRow}>
          <Header>Authors</Header>
          <IconButton
            color="inherit"
            size="small"
            component="div"
            css={{ height: 'fit-content', marginLeft: 4 }}
            onClick={() => {
              newAuthorAdded.current = true;
              setMetadata(
                produce(metadata, draft => {
                  draft.authors.push({ name: '' });
                  return draft;
                }),
              );
            }}
          >
            <AddIcon css={{ fontSize: 14 }} />
          </IconButton>
        </div>
        {metadata.authors.map((author, index) => {
          return (
            <div key={index} css={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <TextField
                required
                autoFocus={index === metadata.authors.length - 1 && newAuthorAdded.current}
                value={author.name}
                css={{ width: 200 }}
                margin="dense"
                onChange={e => {
                  setMetadata(
                    produce(metadata, draft => {
                      draft.authors[index].name = e.target.value;
                    }),
                  );
                }}
              />
              <IconButton
                color="inherit"
                size="small"
                component="div"
                onClick={() => {
                  setMetadata(
                    produce(metadata, draft => {
                      const authorId = draft.authors[index].id;
                      if (authorId) {
                        draft.removed_authors.push(authorId);
                      }
                      draft.authors.splice(index, 1);
                      return draft;
                    }),
                  );
                }}
              >
                <CloseIcon css={{ fontSize: 14 }} />
              </IconButton>
            </div>
          );
        })}
      </div>
      {/* Abstract */}
      <div>
        <Typography variant="h6">Abstract</Typography>
        <TextField
          required
          fullWidth
          value={metadata.abstract}
          margin="dense"
          multiline
          onChange={e => {
            setMetadata({ ...metadata, abstract: e.target.value });
          }}
        />
      </div>
      <div className={styles.actionButtons}>
        <Button
          onClick={() => {
            onClose();
          }}
          variant="outlined"
          color="secondary"
          size="small"
        >
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" size="small">
          Save
        </Button>
      </div>
    </form>
  );
};

export const MetadataEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const metadata: FileMetadata = usePaperStore(
    state => ({
      title: state.title || '',
      authors: state.authors,
      date: state.timePublished || new Date().toString(),
      abstract: state.abstract || '',
      doi: state.doi || '',
    }),
    shallow,
  );
  const editPaper = usePaperStore(state => state.editPaper);
  const onSubmit = async (data: FileMetadata) => {
    try {
      await editPaper(data);
      onClose();
    } catch (e) {
      toast.error('Failed to update paper :(', { autoClose: 3000 });
    }
  };

  return <MetadataEditorInternal {...{ onClose, onSubmit, metadata }} />;
};
