import React from 'react';

export class Locator {
  public location: string | undefined;
}

export const LocationContext = React.createContext<Locator>(new Locator());

export const LocationProvider: React.FC = ({ children }) => {
  const locator = React.useRef(new Locator());
  return <LocationContext.Provider value={locator.current}>{children}</LocationContext.Provider>;
};
