/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';
import { presets } from '../utils';

const sectionToPadding = {
  section: 0,
  subsection: 10,
  subsubsection: 20,
};

const sectionToFontSize = {
  section: 0.9,
  subsection: 0.8,
  subsubsection: 0.7,
};

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
  const regex = new RegExp(`^(\\d+\\.?)+\\s+.{0,50}$`);
  const allHeights = [];
  const optionalSections = [];
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
          if (text.str.match(regex)) {
            optionalSections.push({ ...text, page: pageIdx });
          }
        });
      });
      const heightThreshold = quantile(allHeights, 0.95);
      const heightMedian = quantile(allHeights, 0.5);
      const mostPopularFont = maxKey(fontsCount);
      const sections = optionalSections.filter(
        // big font or median font that is not too common
        section =>
          section.str.match(/\D{3,}/) && // At least 3 non-digits in a row
          (section.height > heightThreshold ||
            (section.height >= heightMedian && section.fontName !== mostPopularFont)),
      );
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

// {backupSections.map((section, idx) => {
//   return (
//     <a
//       href={`#section-${section[1]}`}
//       key={idx}
//       css={css`
//               text-decoration: none;
//               padding-top: 8px;
//               margin-left: ${sectionToPadding[section[0]] || 0}px;
//               color: #5f5f5f;
//               font-size: ${sectionToFontSize[section[0]] || 0.9}rem;
//               &:hover {
//                 text-decoration: underline;
//               }
//             `}
//     >
//       {section[1]}
//     </a>
//   );
// })}
