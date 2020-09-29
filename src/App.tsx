import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import * as ReactHintFactory from 'react-hint';
import { ReactQueryDevtools } from 'react-query-devtools';
import { ToastContainer } from 'react-toastify';
import { Main } from './collab';
import { LoginModal } from './components/Login/LoginModal';
import './react-hint.css';
import { theme } from './themes';
import { useTracker } from './Tracker';

const ReactHint = ReactHintFactory(React);

const App: React.FC = () => {
  useTracker();

  return (
    <MuiThemeProvider theme={theme}>
      <Main />
      <ToastContainer
        position="bottom-center"
        autoClose={false}
        newestOnTop={false}
        closeOnClick={false}
        className="base-toast"
        rtl={false}
        draggable
      />
      <ReactQueryDevtools />
      <LoginModal />
      <ReactHint autoPosition events={{ hover: true }} delay={{ show: 300, hide: 0 }} />
    </MuiThemeProvider>
  );
};

export default App;
