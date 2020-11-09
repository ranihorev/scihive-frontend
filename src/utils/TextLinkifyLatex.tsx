import React from 'react';
import Linkify from 'react-linkify';
import { latexString } from '../utils/latex';

const truncateURL = (url: string) => {
  return `${url.replace(/^https?:\/\//, '').substring(0, 20)}...`;
};

export const componentDecoratorWithTargetBlank = (decoratedHref: string, decoratedText: string, key: number) => {
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

export const LinkifyArxivIds: React.FC = ({ children }) => {
  return (
    <Linkify
      matchDecorator={value => {
        const matches = value.matchAll(/\d{4}\.\d{4,5}/g);
        return [...matches].map(match => {
          return {
            schema: '',
            index: match.index || 0,
            lastIndex: (match.index || 0) + match[0].length,
            text: match[0],
            url: `/paper/${match[0]}`,
          };
        });
      }}
      componentDecorator={componentDecoratorWithTargetBlank}
    >
      {children}
    </Linkify>
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
