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
import { useHistory } from 'react-router';
import { FileMetadata } from '../../models';
import { uploadPaperDetails } from '../../thunks';
import { presets } from '../../utils';

interface AllProps {
  onClose: () => void;
  metadata: FileMetadata;
}

const removeTimezone = (date: Date | null) => {
  if (date !== null) {
    const m = moment(date);
    return m.subtract(m.utcOffset(), 'minutes').toDate();
  }
  return null;
};

class UTCUtils extends MomentUtils {
  format = (value: Moment, formatString: string) => {
    return moment(value)
      .utc()
      .format(formatString);
  };
}

export const MetadataEditor: React.FC<AllProps> = ({ onClose, metadata: inputMetadata }) => {
  const [metadata, setMetadata] = React.useState({
    ...inputMetadata,
    date: removeTimezone(inputMetadata.date),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const isFirstLoad = React.useRef(false);
  const history = useHistory();
  const [secondCancel, setSecondCancel] = React.useState(false);

  React.useEffect(() => {
    setMetadata(inputMetadata);
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
    isFirstLoad.current = false;
  }, [metadata.authors]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        uploadPaperDetails(metadata, (paperId: string) => {
          history.push(`/paper/${paperId}`);
        });
      }}
      css={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}
    >
      <div css={{ color: '#4a4a4a', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Title */}
        <div>
          <Typography variant="h6">Title</Typography>
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
          <Typography variant="h6">Date published</Typography>
          <MuiPickersUtilsProvider utils={UTCUtils}>
            <KeyboardDatePicker
              disableToolbar
              disableFuture
              required
              variant="inline"
              format="MM/DD/YYYY"
              margin="dense"
              open={isDatePickerOpen}
              value={metadata.date}
              onChange={(date, value) => {
                setMetadata({ ...metadata, date: date !== null ? date.utc().toDate() : null });
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
            <Typography variant="h6">Authors</Typography>
            <IconButton
              color="inherit"
              size="small"
              component="div"
              css={{ height: 'fit-content', marginLeft: 4 }}
              onClick={() => {
                isFirstLoad.current = true;
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
                  autoFocus={index === metadata.authors.length - 1 && isFirstLoad.current}
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
