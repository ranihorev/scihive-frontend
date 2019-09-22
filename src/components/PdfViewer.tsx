/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Paper } from '@material-ui/core';
import copy from 'clipboard-copy';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import {
  isValidHighlight,
  Reference,
  References,
  RootState,
  Section,
  TempHighlight,
  T_Highlight,
  T_LTWH,
  T_Position,
} from '../models';
import { presets } from '../utils';
import { popupCss } from '../utils/presets';
import { AreaHighlight, Highlight, PdfAnnotator, PdfLoader } from './Pdf';
import { compactButtonStyle } from './Pdf/components/Tip';
import { viewportToScaled } from './Pdf/lib/coordinates';
import { Popup, PopupManager } from './Popup';
import { TextLinkifyLatex } from './TextLinkifyLatex';

const ReferencesPopupManager: React.FC<{
  referencePopoverAnchor?: HTMLElement;
  clearAnchor: () => void;
  reference: Reference;
}> = ({ referencePopoverAnchor, clearAnchor, reference }) => {
  const content = reference ? (
    <Paper css={popupCss}>
      {reference.arxivId && (
        <div
          css={css`
            ${presets.row};
            width: 100%;
            justify-content: flex-end;
          `}
        >
          <Link
            to={`/paper/${reference.arxivId}`}
            css={css`
              color: ${presets.themePalette.primary.main};
            `}
          >
            <i className="fas fa-external-link-alt" />
          </Link>
        </div>
      )}
      <div
        css={css`
          p {
            margin: 0.2rem;
          }
        `}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: reference.html }}
      />
    </Paper>
  ) : null;

  return <PopupManager anchorEl={referencePopoverAnchor} clearAnchor={clearAnchor} popupContent={content} />;
};

interface PdfViewerProps extends RouteComponentProps {
  url: string;
  isVertical: boolean;
  beforeLoad: React.ReactElement;
  sections?: Section[];
  references: References;
  highlights: T_Highlight[];
  clearJumpTo: () => void;
  updateHighlight: (highlight: T_Highlight) => void;
}

interface PdfViewerState {
  referencePopoverAnchor?: HTMLElement;
  referenceCite: string;
  highlightPopoverAnchor?: HTMLElement;
}

class PdfViewer extends Component<PdfViewerProps, PdfViewerState> {
  state: PdfViewerState = { referenceCite: '' };

  componentDidMount() {
    // const re = new RegExp('(?<type>(section|highlight))-(?<id>.*)');
    // const whereTo = window.location.hash.match(re);
    // if (whereTo && whereTo.groups) {
    //   const { type, id } = whereTo.groups;
    //   if (type === 'highlight') {
    //     const highlight = this.props.highlights.find(h => h.id === id);
    //     if (highlight) {
    //       this.props.jumpTo(type, id, highlight.position);
    //     }
    //   } else if (type === 'section') {
    //     if (this.props.sections[id]) {
    //       this.props.jumpTo(type, id, getSectionPosition(this.props.sections[id]));
    //     }
    //   }
    // }
  }

  render() {
    const { url, isVertical, beforeLoad, references } = this.props;
    const { referencePopoverAnchor, highlightPopoverAnchor, referenceCite } = this.state;
    const errorStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    } as const;
    return (
      <React.Fragment>
        <PdfLoader
          key={url}
          url={url}
          beforeLoad={beforeLoad}
          failed={<div style={errorStyle}>Failed to download paper</div>}
        >
          {pdfDocument => (
            <PdfAnnotator
              pdfDocument={pdfDocument}
              enableAreaSelection={event => event.altKey}
              isVertical={isVertical}
              onReferenceEnter={e => {
                const target = e.target as HTMLElement;
                if (!target) return;
                const cite = decodeURIComponent((target.getAttribute('href') || '').replace('#cite.', ''));
                if (references.hasOwnProperty(cite)) {
                  if (isMobile) {
                    target.onclick = event => {
                      event.preventDefault();
                    };
                  }
                  if (e.type === 'click' && !isMobile) {
                    this.setState({ referencePopoverAnchor: undefined, referenceCite: '' });
                  } else {
                    this.setState({
                      referencePopoverAnchor: target,
                      referenceCite: cite,
                    });
                  }
                }
              }}
            />
          )}
        </PdfLoader>
        {references && (
          <ReferencesPopupManager
            referencePopoverAnchor={referencePopoverAnchor}
            clearAnchor={() => this.setState({ referencePopoverAnchor: undefined, referenceCite: '' })}
            reference={references[referenceCite]}
          />
        )}
        <PopupManager
          anchorEl={highlightPopoverAnchor}
          clearAnchor={() => {
            this.setState({ highlightPopoverAnchor: undefined });
          }}
          popupContent={<div>Hello</div>}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    sections: state.paper.sections,
    references: state.paper.references,
    highlights: state.paper.highlights,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  clearJumpTo: () => {
    dispatch(actions.clearJumpTo());
  },
  updateHighlight: (highlight: T_Highlight) => {
    dispatch(actions.updateHighlight(highlight));
  },
});

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default withRouter(withRedux(PdfViewer));
