/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { isEmpty, range } from 'lodash';
import { PDFDocumentProxy, PDFPageProxy, PDFPromise, TextContent } from 'pdfjs-dist';
import React from 'react';
import ContentLoader from 'react-content-loader';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { actions } from '../actions';
import { RootState, Section, SimplePosition } from '../models';
import { getSectionPosition, presets } from '../utils';

const asc = (arr: number[]) => arr.sort((a, b) => a - b);

const quantile = (arr: number[], q: number) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
};

const maxKey = (obj: { [key: string]: number }) => Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));

const PlaceholderList = () => {
  return (
    <div
      css={css`
        padding-top: 10px;
        padding-left: 5px;
      `}
    >
      {range(0, 5).map(idx => (
        <ContentLoader key={idx} height={100}>
          <React.Fragment>
            <rect x="0" y="0" rx="3" ry="3" width="90%" height="13" />
            <rect x="0" y="30" rx="3" ry="3" width="80%" height="13" />
            <rect x="20" y="60" rx="3" ry="3" width="80%" height="13" />
          </React.Fragment>
        </ContentLoader>
      ))}
    </div>
  );
};

export const extractSections = (document: PDFDocumentProxy, onSuccess: (sections: Section[]) => void) => {
  const allHeights: number[] = [];
  let optionalSections: Section[] = [];
  const fontsCount: { [key: string]: number } = {};

  const pagePromises: PDFPromise<PDFPageProxy>[] = [];
  for (let i = 1; i <= document.numPages; i += 1) {
    pagePromises.push(document.getPage(i));
  }
  // We cast as unknown because we're too lazy to fight with TS
  Promise.all((pagePromises as unknown) as Promise<PDFPageProxy>[]).then(allPages => {
    const contentPromises = allPages.map(page => page.getTextContent());
    Promise.all((contentPromises as unknown) as Promise<TextContent>[]).then(allContent => {
      allContent.forEach((content, pageIdx) => {
        content.items.forEach(text => {
          allHeights.push(text.height);
          if (fontsCount[text.fontName] === undefined) fontsCount[text.fontName] = 0;
          fontsCount[text.fontName] += 1;
          if (text.str.match(/^(\d+\.?)+\s+.{0,60}$/)) {
            optionalSections.push({ ...text, page: pageIdx });
          }
        });
      });
      const heightThreshold = quantile(allHeights, 0.95);
      const heightMedian = quantile(allHeights, 0.5);
      const mostPopularFont = maxKey(fontsCount);
      optionalSections.forEach(section => {
        section.str = section.str.replace(/  +/g, ' ');
      });
      optionalSections = optionalSections.filter(
        // big font or median font that is not too common
        section =>
          section.str.match(/\D{3,}/) && // At least 3 non-digits in a row
          (section.height > heightThreshold ||
            (section.height >= heightMedian && section.fontName !== mostPopularFont)),
      );
      const sections = [];
      let lastSectionSplit;
      let sectionFound;
      for (const section of optionalSections) {
        sectionFound = false;
        const matches = section.str.match(/^(\d+\.?)+/);
        if (!matches) {
          console.warn('No matches for section', section);
          continue;
        }
        const sectionNumber = matches[0];
        const splitNumbers = sectionNumber.match(/\d+/g);
        if (!splitNumbers) {
          console.warn('No numbers in section', section);
          continue;
        }
        if (!lastSectionSplit) {
          if (splitNumbers[0] === '1') {
            sectionFound = true;
          }
        } else {
          // TODO: This is ugly, fix this!
          switch (splitNumbers.length) {
            case lastSectionSplit.length + 1:
              // new level
              if (splitNumbers[splitNumbers.length - 1] === '1') {
                sectionFound = true;
              }
              break;
            case lastSectionSplit.length:
              // same level
              if (
                parseInt(splitNumbers[splitNumbers.length - 1], 0) ===
                parseInt(lastSectionSplit[lastSectionSplit.length - 1], 0) + 1
              ) {
                sectionFound = true;
              }
              break;
            case lastSectionSplit.length - 1:
              // one level up
              if (
                parseInt(splitNumbers[splitNumbers.length - 1], 0) ===
                parseInt(lastSectionSplit[lastSectionSplit.length - 2], 0) + 1
              ) {
                sectionFound = true;
              }
              break;
            case lastSectionSplit.length - 2:
              // two levels up
              if (
                parseInt(splitNumbers[splitNumbers.length - 1], 0) ===
                parseInt(lastSectionSplit[lastSectionSplit.length - 3], 0) + 1
              ) {
                sectionFound = true;
              }
              break;
            case lastSectionSplit.length - 3:
              // three levels up
              if (
                parseInt(splitNumbers[splitNumbers.length - 1], 0) ===
                parseInt(lastSectionSplit[lastSectionSplit.length - 4], 0) + 1
              ) {
                sectionFound = true;
              }
              break;
            case lastSectionSplit.length - 4:
              // three levels up
              if (
                parseInt(splitNumbers[splitNumbers.length - 1], 0) ===
                parseInt(lastSectionSplit[lastSectionSplit.length - 5], 0) + 1
              ) {
                sectionFound = true;
              }
              break;

            default:
              break;
          }
        }
        if (sectionFound) {
          sections.push(section);
          lastSectionSplit = splitNumbers;
        }
      }
      // Fallback to Roman numerals
      if (isEmpty(sections)) {
        allContent.forEach((content, pageIdx) => {
          content.items.forEach(text => {
            if (text.str.match(/^(IX|IV|VI{0,3}|I{1,3})\.\s+.{0,60}$/)) {
              sections.push({ ...text, page: pageIdx });
            }
          });
        });
      }
      onSuccess(sections);
    });
  });
};

interface PaperSectionsProps extends RouteComponentProps {
  sections?: Section[];
  jumpToSection: (index: number, location: { pageNumber: number; position: number }) => void;
}

const PaperSectionsRender: React.FC<PaperSectionsProps> = ({ sections, jumpToSection, history }) => {
  return (
    <div
      css={css`
        ${presets.col};
        padding: 10px 10px;
        overflow-y: auto;
      `}
    >
      {sections ? (
        sections.map((section, idx) => {
          return (
            <span
              onClick={() => {
                jumpToSection(idx, getSectionPosition(section));
                history.push({ hash: `section-${idx}` });
              }}
              key={idx}
              css={css`
                text-decoration: none;
                padding-top: 8px;
                margin-left: 0px;
                cursor: pointer;
                color: #5f5f5f;
                font-size: 0.85rem;
                &:hover {
                  text-decoration: underline;
                }
              `}
            >
              {section.str}
            </span>
          );
        })
      ) : (
        <PlaceholderList />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    sections: state.paper.sections,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    jumpToSection: (id: number, location: SimplePosition) => {
      dispatch(actions.jumpTo({ area: 'paper', type: 'section', id: id.toString(), location }));
    },
  };
};

const withRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export const PaperSections = withRedux(withRouter(PaperSectionsRender));
