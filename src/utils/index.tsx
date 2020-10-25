import * as presets from './presets';
import { Section } from '../models';

export const getSectionPosition = (section: Section) => ({
  pageNumber: section.page + 1,
  position: section.transform[section.transform.length - 1] + section.height,
});

export const createEvent = <D extends any>(type: string, details: D) => {
  return new CustomEvent<D>(type, { detail: details });
};

export const createListener = <T extends object>(type: string, cb: (event: CustomEvent<T>) => void) => {
  document.addEventListener(type, cb as EventListener);
  return () => document.removeEventListener(type, cb as EventListener);
};

export const isMac = /mac/i.test(navigator.platform);

export { presets };
