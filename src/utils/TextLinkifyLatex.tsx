import React from 'react';
import Linkify from 'react-linkify';
import { latexString } from '../utils/latex';

const truncateURL = (url: string) => {
  return `${url.replace(/^https?:\/\//, '').substring(0, 20)}...`;
};

const componentDecoratorWithTargetBlank = (decoratedHref: string, decoratedText: string, key: number) => {
  return (
    <a
      href={decoratedHref}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline"
    >
      {decoratedText}
    </a>
  );
};

export const TextLinkifyLatex: React.FC<{ text: string }> = ({ text }) => {
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
