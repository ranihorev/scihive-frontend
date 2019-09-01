// Based  on https://github.com/zzish/react-latex/
import React from 'react';
import katex from 'katex';

interface LatexItem {
  type: 'text' | 'latex';
  string: string;
}

export const latexString = (text: string, options?: any) => {
  // Remove potential HTML
  const strNoHtml = text.replace(/(<([^>]+)>)/gi, '');
  const regularExpression = /\$\$[\s\S]+?\$\$|\$[\s\S]+?\$/g;

  const stripDollars = (stringToStrip: string) => {
    if (stringToStrip[1] === '$') {
      return stringToStrip.slice(2, -2);
    }
    return stringToStrip.slice(1, -1);
  };

  const renderLatexString = (s: string) => {
    let renderedString;
    try {
      renderedString = katex.renderToString(s, options);
    } catch (err) {
      console.error('couldn`t convert string', s);
      return s;
    }
    return renderedString;
  };

  const result: LatexItem[] = [];

  const latexMatch = strNoHtml.match(regularExpression);
  const stringWithoutLatex = strNoHtml.split(regularExpression);

  if (latexMatch) {
    stringWithoutLatex.forEach((s, index) => {
      result.push({
        string: s,
        type: 'text',
      });
      if (latexMatch[index]) {
        result.push({
          string: stripDollars(latexMatch[index]),
          type: 'latex',
        });
      }
    });
  } else {
    result.push({
      string: text,
      type: 'text',
    });
  }

  const processResult = (resultToProcess: LatexItem[]) => {
    const newResult = resultToProcess.map(r => {
      if (r.type === 'text') {
        return r;
      }
      return { ...r, string: renderLatexString(r.string) };
    });

    return newResult;
  };
  return processResult(result);
};

export const Latex: React.FC<{ children: string, displayMode: any }> = ({ children, displayMode }) => {
  const content = latexString(children, { displayMode });
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: content.map(item => item.string).join(' '),
      }}
    />
  );
};
