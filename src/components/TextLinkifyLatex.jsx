import React from 'react';
import Linkify from 'react-linkify';
import { latexString } from '../utils/latex';

const truncateURL = url => {
  return `${url.replace(/^https?:\/\//, '').substring(0, 20)}...`;
};

const componentDecoratorWithTargetBlank = (decoratedHref: string, decoratedText: string, key: number): React.Node => {
  return (
    <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer">
      {decoratedText}
    </a>
  );
};

export const TextLinkifyLatex = ({ text }) => {
  const textsWithLatex = latexString(text);
  return (
    <React.Fragment>
      {textsWithLatex.map((t, idx) => (
        <React.Fragment key={idx}>
          {t.type === 'text' ? (
            <Linkify componentDecorator={componentDecoratorWithTargetBlank} textDecorator={truncateURL}>
              {t.string}
            </Linkify>
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: t.string,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};
