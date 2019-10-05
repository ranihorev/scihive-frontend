/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import { isEmpty } from 'lodash';
import * as queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Dispatch } from 'redux';
import useDeepCompareEffect from 'use-deep-compare-effect';
import useReactRouter from 'use-react-router';
import { actions } from '../actions';
import { Acronyms, CodeMeta, Group, References, RootState, T_Highlight } from '../models';
import { presets } from '../utils';
import PdfViewer from './PdfViewer';
import { ReadingProgress } from './ReadingProgress';
import Resizer from './Resizer';
import { CollapseButton, Sidebar } from './Sidebar';
import { APP_BAR_HEIGHT } from './TopBar/PrimaryAppBar';

const FETCHING = '-1';
const FAILED = '0';
const MOBILE_WIDTH = 800;

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
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

interface PdfCommenterProps {
  setBookmark: (value: boolean) => void;
  setCodeMeta: (meta: CodeMeta) => void;
  selectGroup: (group: Group) => void;
  setGroups: (group: Group[]) => void;
  isLoggedIn: boolean;
  setReferences: (references: References) => void;
  setHighlights: (highlights: T_Highlight[]) => void;
  setAcronyms: (acronyms: Acronyms) => void;
  clearPaper: () => void;
}

const PdfCommenter: React.FC<PdfCommenterProps> = ({
  setBookmark,
  setCodeMeta,
  selectGroup,
  setGroups,
  isLoggedIn,
  setReferences,
  setHighlights,
  setAcronyms,
  clearPaper,
}) => {
  const [url, setUrl] = useState(FETCHING);
  const [title, setTitle] = useState('SciHive');
  const { height: pageHeight, width: pageWidth } = useWindowDimensions();
  const contentHeight = pageHeight - APP_BAR_HEIGHT;
  const defaultPdfPrct = 0.75;
  const [pdfSectionPrct, setPdfSectionPrct] = useState({
    width: defaultPdfPrct,
    height: defaultPdfPrct,
  });

  const {
    location,
    match: { params },
  } = useReactRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fetch_paper_data = () => {
    // Fetch refernces
    axios
      .get(`/paper/${params.PaperId}/references`)
      .then(res => {
        setReferences(res.data);
      })
      .catch(err => {
        console.warn(err.response);
      });

    // Fetch acronyms
    axios
      .get(`/paper/${params.PaperId}/acronyms`)
      .then(res => {
        setAcronyms(res.data);
      })
      .catch(err => {
        console.warn(err.response);
      });
  };

  useDeepCompareEffect(() => {
    // Fetch paper data
    setUrl(FETCHING);
    clearPaper();
    axios
      .get(`/paper/${params.PaperId}`)
      .then(res => {
        setUrl(res.data.url);
        setBookmark(res.data.saved_in_library);
        setCodeMeta(res.data.code);
        if (res.data.title) setTitle(`SciHive - ${res.data.title}`);
        fetch_paper_data();
      })
      .catch(() => {
        setUrl(FAILED);
      });

    const selectedGroupId = queryString.parse(location.search).group;
    // Fetch comments
    axios
      .get(`/paper/${params.PaperId}/comments`, {
        params: { group: selectedGroupId },
      })
      .then(res => {
        setHighlights(res.data.comments);
      })
      .catch(err => {
        console.log(err.response);
      });

    // Fetch groups
    if (isLoggedIn) {
      if (selectedGroupId) {
        axios
          .post('/groups/all', { id: selectedGroupId })
          .then(res => {
            const groups: Group[] = res.data;
            setGroups(groups);
            const group = groups.find(g => g.id === selectedGroupId);
            if (group) {
              selectGroup(group);
              toast.success(<span>Welcome to Group {group.name}</span>, {
                autoClose: 2000,
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

  const Loader = (
    <div
      css={css`
        position: absolute;
        top: 50%;
        left: 50%;
      `}
    >
      <CircularProgress />
    </div>
  );

  // Vertical is for mobile phones
  const isVertical = window.innerWidth < MOBILE_WIDTH;

  let viewerRender = null;
  if (url === FETCHING) {
    viewerRender = Loader;
  } else if (url === FAILED) {
    viewerRender = <div style={{ textAlign: 'center' }}>PDF file does not exist</div>;
  } else {
    viewerRender = <PdfViewer beforeLoad={Loader} isVertical={isVertical} url={url} />;
  }

  const sidebarWidth = pageWidth * (1 - pdfSectionPrct.width);
  const sidebarHeight = contentHeight * (1 - pdfSectionPrct.height);

  const onCollapseClick = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    setPdfSectionPrct({
      ...pdfSectionPrct,
      width: newState ? 1 : defaultPdfPrct,
    });
  };

  const SidebarElement = (
    <Sidebar
      height={sidebarHeight}
      width={sidebarWidth}
      isCollapsed={isSidebarCollapsed}
      isVertical={isVertical}
      onCollapseClick={onCollapseClick}
    />
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        style={{
          position: 'relative',
          height: contentHeight,
          overflowY: 'hidden',
        }}
      >
        <ReadingProgress />
        {isVertical ? (
          <React.Fragment>
            <Resizer
              key={`${pageWidth}-${pageHeight}`}
              initPos={contentHeight * pdfSectionPrct.height}
              onDrag={({ y }) => {
                setPdfSectionPrct({
                  ...pdfSectionPrct,
                  height: y / contentHeight,
                });
              }}
              bounds={{
                left: 0,
                right: 0,
                top: 50,
                bottom: contentHeight - 50,
              }}
              step={10}
              isVerticalLine={false}
            />
            <div
              css={css`
                ${presets.col};
                width: 100%;
              `}
            >
              <div
                style={{ height: contentHeight * pdfSectionPrct.height }}
                css={css`
                  position: relative;
                  overflow: hidden;
                  display: flex;
                `}
              >
                {viewerRender}
              </div>
              {SidebarElement}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!isSidebarCollapsed ? (
              <Resizer
                key={`${pageWidth}-${pageHeight}`}
                initPos={sidebarWidth}
                onDrag={({ x }) =>
                  setPdfSectionPrct({
                    ...pdfSectionPrct,
                    width: (pageWidth - x) / pageWidth,
                  })
                }
                bounds={{ left: 200, right: 600, top: 0, bottom: 0 }}
                isVerticalLine={true}
              />
            ) : (
              <div
                css={css`
                  position: absolute;
                  top: 4px;
                  left: 0;
                  z-index: 10;
                `}
              >
                <CollapseButton direction={isSidebarCollapsed ? 'right' : 'left'} onClick={onCollapseClick} />
              </div>
            )}
            <div
              css={css`
                ${presets.row};
                height: 100%;
              `}
            >
              {SidebarElement}
              <div
                style={{ width: pdfSectionPrct.width * pageWidth }}
                css={css`
                  position: relative;
                `}
              >
                {viewerRender}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: !isEmpty(state.user.userData),
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setBookmark: (value: boolean) => {
      dispatch(actions.setBookmark(value));
    },
    selectGroup: (group: Group) => {
      dispatch(actions.selectGroup(group));
    },
    setGroups: (groups: Group[]) => {
      dispatch(actions.setGroups(groups));
    },
    clearPaper: () => {
      dispatch(actions.clearPaper());
    },
    setReferences: (references: References) => {
      dispatch(actions.setReferences(references));
    },
    setHighlights: (highlights: T_Highlight[]) => {
      dispatch(actions.setHighlights(highlights));
    },
    setAcronyms: (acronyms: Acronyms) => {
      dispatch(actions.setAcronyms(acronyms));
    },
    setCodeMeta: (meta: CodeMeta) => {
      dispatch(actions.setCodeMeta(meta));
    },
  };
};
const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRedux(PdfCommenter);
