import { themePalette } from './utils/presets';
import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  palette: themePalette,
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },
});
