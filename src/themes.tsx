import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';
import { themePalette } from './utils/presets';

const themeInner = createMuiTheme({
  palette: themePalette,
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    h3: {
      fontSize: '1.7rem',
    },
    h4: {
      fontSize: '1.4rem',
      color: themePalette.title.main,
      fontWeight: 500,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    h5: {
      fontSize: '1.2rem',
    },
    h6: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
  },
});

export const theme = responsiveFontSizes(themeInner);
