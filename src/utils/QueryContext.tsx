import React from 'react';
import { PapersListRequestParams } from '../models';

export class Query {
  public query: Partial<PapersListRequestParams> | undefined;
}

export const QueryContext = React.createContext<Query>(new Query());

export const QueryProvider: React.FC = ({ children }) => {
  const query = React.useRef(new Query());
  return <QueryContext.Provider value={query.current}>{children}</QueryContext.Provider>;
};
