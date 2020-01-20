/** @jsx jsx */
import MomentUtils from '@date-io/moment';
import { jsx } from '@emotion/core';
import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import produce from 'immer';
import moment, { Moment } from 'moment';
import React from 'react';
import { FileMetadata } from '../../models';
import { presets } from '../../utils';

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
    <Typography variant="h6" css={{ fontSize: 18 }}>
      {children}
    </Typography>
  );
};

export const MetadataEditor: React.FC<AllProps> = ({ onSubmit, onClose, metadata: inputMetadata }) => {
  const [metadata, setMetadata] = React.useState<FileMetadataInternal>({
    ...inputMetadata,
    title: inputMetadata.title || '',
    date: moment.utc(inputMetadata.date),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const newAuthorAdded = React.useRef(false);
  const isFirstLoad = React.useRef(true);
  const [secondCancel, setSecondCancel] = React.useState(false);

  React.useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    setMetadata({ ...inputMetadata, date: moment.utc(inputMetadata.date) });
  }, [inputMetadata]);

  React.useEffect(() => {
    if (secondCancel) {
      const timeoutId = setTimeout(() => {
        setSecondCancel(false);
      }, 5000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    return;
  }, [secondCancel]);

  React.useEffect(() => {
    newAuthorAdded.current = false;
  }, [metadata.authors]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ ...metadata, date: metadata.date.toISOString() });
      }}
      css={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}
    >
      <div css={{ color: '#4a4a4a', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
        <div css={{ marginTop: 24 }}>
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
                'aria-label': 'change date',
              }}
              PopoverProps={{
                onClose: () => setIsDatePickerOpen(false),
              }}
            />
          </MuiPickersUtilsProvider>
        </div>
        {/* Authors */}
        <div css={{ marginTop: 24 }}>
          <div css={[presets.row, { alignItems: 'center' }]}>
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
        <div css={{ marginTop: 24 }}>
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
      </div>
      <div css={{ marginTop: 24, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          onClick={() => {
            if (secondCancel) {
              onClose();
            } else {
              setSecondCancel(true);
            }
          }}
          variant="outlined"
          color="secondary"
          css={{ width: 120, paddingLeft: 5, paddingRight: 5 }}
        >
          {secondCancel ? 'Are you sure?' : 'Cancel'}
        </Button>
        <Button type="submit" variant="contained" color="primary" css={{ width: 120 }}>
          Save
        </Button>
      </div>
    </form>
  );
};
