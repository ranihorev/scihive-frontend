/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { connect } from 'react-redux';
import { presets } from '../utils';

const asc = arr => arr.sort((a, b) => a - b);

const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
};

const maxKey = obj => Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));

export const extractSections = (document, onSuccess) => {
  const allHeights = [];
  let optionalSections = [];
  const fontsCount = {};

  const pagePromises = [];
  for (let i = 1; i <= document.numPages; i += 1) {
    pagePromises.push(document.getPage(i));
  }
  let contentPromises = [];
  Promise.all(pagePromises).then(allPages => {
    contentPromises = allPages.map(page => page.getTextContent());
    Promise.all(contentPromises).then(allContent => {
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
        const sectionNumber = section.str.match(/^(\d+\.?)+/)[0];
        const splitNumbers = sectionNumber.match(/\d+/g);
        if (!lastSectionSplit) {
          if (splitNumbers[0] === '1') {
            sectionFound = true;
          }
        } else {
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
      onSuccess(sections);
    });
  });
};

const PaperSectionsRender = ({ sections }) => {
  if (sections === undefined) return null;

  return (
    <div
      css={css`
        ${presets.col};
        padding: 20px 10px;
        overflow-y: auto;
      `}
    >
      {sections.map((section, idx) => {
        return (
          <a
            href={`#section-${idx}`}
            key={idx}
            css={css`
              text-decoration: none;
              padding-top: 8px;
              margin-left: 0px;
              color: #5f5f5f;
              font-size: 0.85rem;
              &:hover {
                text-decoration: underline;
              }
            `}
          >
            {section.str}
          </a>
        );
      })}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    sections: state.paper.sections,
  };
};

const withRedux = connect(mapStateToProps);

export const PaperSections = withRedux(PaperSectionsRender);
