// @flow

import React, {useEffect, useState} from 'react';
import CommentsList from "./CommentsList";
import PdfViewer from "./PdfViewer";
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import {withRouter} from "react-router";
import './PdfCommenter.scss';
import SplitPane from "react-split-pane";
import ReadingProgress from "./ReadingProgress";
import CircularProgress from "@material-ui/core/CircularProgress";
import {actions } from "../actions";
import {connect} from "react-redux";
import * as queryString from "query-string";
import {toast} from "react-toastify";

const styles = theme => ({
  rootVert: {
    flexGrow: 1,
    backgroundColor: '#eeeeee'
  },
  rootHorz: {
    paddingTop: '8px',
    backgroundColor: '#eeeeee',
  },
  pdf: {
    height: "100vh",
    overflowY: "scroll",
    position: "relative"
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});
const FETCHING = '-1';
const FAILED = '0';
const MOBILE_WIDTH = 800;

const PdfCommenter = ({setBookmark, classes, location, match: {params}, selectGroup, setGroups}) => {

  const [highlights, setHighlights] = useState([]);
  const [url, setUrl] = useState(FETCHING);

  useEffect(() => {
    // Fetch paper data
    axios.get(`/paper/${params.PaperId}`)
      .then(res => {
        setUrl(res.data.url);
        setBookmark(res.data.saved_in_library);
      })
      .catch(err => {
        setUrl(FAILED)
      });

    const selectedGroupId = queryString.parse(location.search).group;

    // Fetch comments
    axios.get(`/paper/${params.PaperId}/comments`, {params: {group: selectedGroupId}})
      .then(res => {
        setHighlights(res.data.comments);
      }).catch(err => {
      console.log(err.response);
    });

    if (selectedGroupId) {
      axios.post('/groups/all', {id: selectedGroupId})
        .then(res => {
          const groups = res.data;
          setGroups(groups);
          const group = groups.find(g => g.id === selectedGroupId);
          if (group) {
            selectGroup(group);
            toast.success(<span>Welcome to Group {group.name}</span>, {autoClose: 2000});
          }
        })
        .catch(e => console.warn(e.message));
    } else {
      axios.get('/groups/all')
        .then(res => {
          setGroups(res.data);
        })
        .catch(e => console.warn(e.message));
    }

  }, [params]);

  const addHighlight = (highlight: T_NewHighlight) => {
    setHighlights([highlight, ...highlights]);
  };

  const updateHighlight = (highlight: T_NewHighlight) => {
    setHighlights(highlights.map(h => {
        return h.id === highlight.id ? highlight : h;
      })
    );
  };

  const removeHighlight = (highlightId: string) => {
    axios.delete(`/paper/${params.PaperId}/comment/${highlightId}`, {id: highlightId})
      .then(res => {
        setHighlights(highlights.filter(h => h.id !== highlightId));
      })
      .catch(err => console.log(err.response));
  };

  const Loader = <div className={classes.spinner}><CircularProgress /></div>
  const isVertical = window.innerWidth < MOBILE_WIDTH;

  let viewerRender = null;
  if (url === FETCHING) {
    viewerRender = Loader;
  }
  else if (url === FAILED) {
    viewerRender = <div style={{textAlign: 'center'}}>PDF file does not exist</div>
  } else {
    viewerRender = <PdfViewer
      updateHighlight={updateHighlight}
      addHighlight={addHighlight}
      highlights={highlights}
      beforeLoad={Loader}
      isVertical={isVertical}
      url={url}
    />
  }

  const comments = <CommentsList
    highlights={highlights}
    removeHighlight={removeHighlight}
    updateHighlight={updateHighlight}
    isVertical={isVertical}
  />

  // Vertical is for mobile phones
  return (
    <div style={{position: 'relative', height: 'calc(100% - 64px)'}}>
      <ReadingProgress />
      {isVertical ?
        <SplitPane split={"horizontal"}
                   defaultSize={'75%'}
                   className={classes.rootHorz}
        >
          <React.Fragment>
            {viewerRender}
          </React.Fragment>
          <React.Fragment>
            {comments}
          </React.Fragment>
        </SplitPane>
        :
        <SplitPane split={"vertical"}
                   minSize={200}
                   maxSize={600}
                   primary="first"
                   defaultSize={'25%'}
                   className={classes.rootVert}
        >
          <React.Fragment>
            {comments}
          </React.Fragment>
          <React.Fragment>
            {viewerRender}
          </React.Fragment>
        </SplitPane>

      }

    </div>
  )

};


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setBookmark: (value) => {
      dispatch(actions.setBookmark(value));
    },
    selectGroup: (group) => {
      dispatch(actions.selectGroup(group));
    },
    setGroups: (groups) => {
      dispatch(actions.setGroups(groups));
    },
  }
};
const withRedux = connect(null, mapDispatchToProps);

export default withRedux(withStyles(styles)(withRouter(PdfCommenter)));
