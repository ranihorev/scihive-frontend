import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';
import { themePalette } from './utils/presets';

const themeInner = createMuiTheme({
  palette: themePalette,
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    h3: {
      fontSize: '2.2rem',
    },
    h4: {
      fontSize: '1.7rem',
    },
    h5: {
      fontSize: '1.3rem',
    },
    h6: {
      fontSize: '1rem',
    },
  },
});

export const theme = responsiveFontSizes(themeInner);
