
import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function TagSelector() {
  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={availableTags}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      renderOption={(option, { selected }) => (
        <React.Fragment>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </React.Fragment>
      )}
      style={{ width: 1000 }}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" label="My interests" placeholder="Topics" />
      )}
    />
  );
}

const availableTags = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'gr-qc', name: 'General relativity & quantum cosmology' },
  { id: 'gr-qc', name: 'Condensed matter physics' },
  { id: 'gr-qc', name: 'Astronomy' },
  { id: 'gr-qc', name: 'Mathematical physics' },
  { id: 'gr-qc', name: 'Marine biology' },
  { id: 'gr-qc', name: 'Disordered Systems and Neural Networks' },
  { id: 'gr-qc', name: 'Nuclear Physics - Experiment' },
  { id: 'gr-qc', name: 'Quantum Physics' },
  { id: 'gr-qc', name: 'Robotics' },
  { id: 'gr-qc', name: 'Artificial Intelligence' }
];
