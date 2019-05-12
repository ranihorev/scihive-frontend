// @flow

import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { withRouter } from 'react-router';
import SplitPane from 'react-split-pane';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';
import * as queryString from 'query-string';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';
import {Helmet} from "react-helmet";
import { actions } from '../actions';
import ReadingProgress from './ReadingProgress';
import PdfViewer from './PdfViewer';
import CommentsList from './CommentsList';
import { APP_BAR_HEIGHT } from './TopBar/PrimaryAppBar';
import type { T_NewHighlight } from './Pdf/types';
import './PdfCommenter.scss';

const styles = () => ({
  rootVert: {
    backgroundColor: '#eeeeee'
  },
  rootHorz: {
    paddingTop: '8px',
    backgroundColor: '#eeeeee'
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
});
const FETCHING = '-1';
const FAILED = '0';
const MOBILE_WIDTH = 800;

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('touchmove', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchmove', handleResize);
    };
  }, []);

  return windowDimensions;
};

const PdfCommenter = ({
  setBookmark,
  classes,
  location,
  match: { params },
  selectGroup,
  setGroups,
  isLoggedIn
}) => {
  const [highlights, setHighlights] = useState([]);
  const [url, setUrl] = useState(FETCHING);
  const [title, setTitle] = useState('SciHive');
  const { height: pageHeight, width: pageWidth } = useWindowDimensions();
  const contentHeight = pageHeight - APP_BAR_HEIGHT;
  const defaultPdfPrct = 0.75;
  const [commentsSectionHeight, setCommentsSectionHeight] = useState(
    (1 - defaultPdfPrct) * contentHeight
  );
  const [pdfSectionWidth, setPdfSectionWidth] = useState(
    defaultPdfPrct * pageWidth
  );

  useEffect(() => {
    // Fetch paper data
    axios
      .get(`/paper/${params.PaperId}`)
      .then(res => {
        setUrl(res.data.url);
        setBookmark(res.data.saved_in_library);
        if (res.data.title) setTitle(`SciHive - ${res.data.title}`);
      })
      .catch(() => {
        setUrl(FAILED);
      });

    const selectedGroupId = queryString.parse(location.search).group;

    // Fetch comments
    axios
      .get(`/paper/${params.PaperId}/comments`, {
        params: { group: selectedGroupId }
      })
      .then(res => {
        setHighlights(res.data.comments);
      })
      .catch(err => {
        console.log(err.response);
      });
    if (isLoggedIn) {
      if (selectedGroupId) {
        axios
          .post('/groups/all', { id: selectedGroupId })
          .then(res => {
            const groups = res.data;
            setGroups(groups);
            const group = groups.find(g => g.id === selectedGroupId);
            if (group) {
              selectGroup(group);
              toast.success(<span>Welcome to Group {group.name}</span>, {
                autoClose: 2000
              });
            }
          })
          .catch(e => console.warn(e.message));
      } else {
        axios
          .get('/groups/all')
          .then(res => {
            setGroups(res.data);
          })
          .catch(e => console.warn(e.message));
      }
    }
  }, [params]);

  const addHighlight = (highlight: T_NewHighlight) => {
    setHighlights([highlight, ...highlights]);
  };

  const updateHighlight = (highlight: T_NewHighlight) => {
    setHighlights(
      highlights.map(h => {
        return h.id === highlight.id ? highlight : h;
      })
    );
  };

  const removeHighlight = (highlightId: string) => {
    axios
      .delete(`/paper/${params.PaperId}/comment/${highlightId}`, {
        id: highlightId
      })
      .then(() => {
        setHighlights(highlights.filter(h => h.id !== highlightId));
      })
      .catch(err => console.log(err.response));
  };

  const Loader = (
    <div className={classes.spinner}>
      <CircularProgress />
    </div>
  );
  const isVertical = window.innerWidth < MOBILE_WIDTH;

  let viewerRender = null;
  if (url === FETCHING) {
    viewerRender = Loader;
  } else if (url === FAILED) {
    viewerRender = (
      <div style={{ textAlign: 'center' }}>PDF file does not exist</div>
    );
  } else {
    viewerRender = (
      <PdfViewer
        updateHighlight={updateHighlight}
        addHighlight={addHighlight}
        highlights={highlights}
        beforeLoad={Loader}
        isVertical={isVertical}
        url={url}
      />
    );
  }

  const comments = (
    <CommentsList
      highlights={highlights}
      removeHighlight={removeHighlight}
      updateHighlight={updateHighlight}
      isVertical={isVertical}
    />
  );

  // Vertical is for mobile phones
  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        style={{
          position: 'relative',
          height: contentHeight,
          overflowY: 'hidden'
        }}
      >
        <ReadingProgress />
        {isVertical ? (
          <SplitPane
            split="horizontal"
            defaultSize={defaultPdfPrct * contentHeight}
            className={classes.rootHorz}
            pane2Style={{ paddingBottom: '5px', height: commentsSectionHeight }}
            onChange={size => setCommentsSectionHeight(size)}
          >
            <React.Fragment>{viewerRender}</React.Fragment>
            <React.Fragment>{comments}</React.Fragment>
          </SplitPane>
        ) : (
          <SplitPane
            split="vertical"
            minSize={300}
            defaultSize={defaultPdfPrct * pageWidth}
            className={classes.rootVert}
            primary="second"
            pane2Style={{ width: pdfSectionWidth }}
            onChange={size => setPdfSectionWidth(size)}
          >
            <React.Fragment>{comments}</React.Fragment>
            <React.Fragment>{viewerRender}</React.Fragment>
          </SplitPane>
        )}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    isLoggedIn: !isEmpty(state.user.userData)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setBookmark: value => {
      dispatch(actions.setBookmark(value));
    },
    selectGroup: group => {
      dispatch(actions.selectGroup(group));
    },
    setGroups: groups => {
      dispatch(actions.setGroups(groups));
    }
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default withRedux(withStyles(styles)(withRouter(PdfCommenter)));
