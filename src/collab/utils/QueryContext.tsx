import React from 'react';
import { RequestParams } from '../../stores/papersList';

export class Query {
  public query: Partial<RequestParams> | undefined;
}

export const QueryContext = React.createContext<Query>(new Query());

export const QueryProvider: React.FC = ({ children }) => {
  const query = React.useRef(new Query());
  return <QueryContext.Provider value={query.current}>{children}</QueryContext.Provider>;
};
