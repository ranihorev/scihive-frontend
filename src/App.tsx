import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import * as ReactHintFactory from 'react-hint';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoginModal } from './auth/LoginModal';
import { PrivateRoute } from './auth/PrivateRoute';
import { useIsLoggedIn } from './auth/utils';
import { Groups } from './groups';
import { Landing } from './Landing';
import { NotFound } from './NotFound';
import { PdfPaperPage } from './paper';
import { PapersList } from './papersList';
import './react-hint.css';
import { theme } from './themes';
import { useTracker } from './Tracker';
import { Unsubscribe } from './Unsubscribe';
import { Upload } from './upload';
import { QueryProvider } from './utils/QueryContext';
import { TermOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';

const MainRoutes: React.FC = () => {
  useIsLoggedIn();
  return (
    <QueryProvider>
      <Switch>
        <Route path="/" exact component={Landing} />
        <Route path="/start" exact component={Landing} />
        <Route path="/user/unsubscribe/:token" exact component={Unsubscribe} />
        <Route path="/discover" exact>
          <PapersList />
        </Route>
        <PrivateRoute path="/library" exact>
          <PapersList isLibraryMode />
        </PrivateRoute>
        <PrivateRoute path="/collections" exact component={Groups} />
        <PrivateRoute path="/upload" exact component={Upload} />
        <PrivateRoute path="/paper/:paperId/invite" exact>
          <PdfPaperPage showInviteOnLoad />
        </PrivateRoute>
        <Route path="/paper/:paperId" exact>
          <PdfPaperPage />
        </Route>
        <Route path="/privacy-policy" exact component={PrivacyPolicy} />
        <Route path="/terms-of-service" exact component={TermOfService} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </QueryProvider>
  );
};

const ReactHint = ReactHintFactory(React);

const App: React.FC = () => {
  useTracker();

  return (
    <MuiThemeProvider theme={theme}>
      <MainRoutes />
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
