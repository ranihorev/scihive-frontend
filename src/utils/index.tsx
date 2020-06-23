import * as presets from './presets';
import { Section } from '../models';

export const getSectionPosition = (section: Section) => ({
  pageNumber: section.page + 1,
  position: section.transform[section.transform.length - 1] + section.height + 5,
});

const createEvent = <T extends string, D extends any>(type: T, details: D) => {
  return new CustomEvent<D>(type, { detail: details });
};

export const eventsGenerator = {
  updateLibrary: (payload: { checked: boolean }) => createEvent('updateLibrary', payload),
};

export type EventTypes = keyof typeof eventsGenerator;
export type MyCustomEvent<T extends EventTypes> = ReturnType<typeof eventsGenerator[T]>;

export const createListener = <T extends EventTypes>(
  type: T,
  cb: (event: ReturnType<typeof eventsGenerator[T]>) => void,
) => {
  document.addEventListener(type, cb as EventListener);
};

export const removeListener = <T extends EventTypes>(
  type: T,
  cb: (event: ReturnType<typeof eventsGenerator[T]>) => void,
) => {
  document.removeEventListener(type, cb as EventListener);
};

interface EventExtender<T> {
  addKey: (event: MouseEvent, data: T) => void;
  getKey: (event: MouseEvent) => T | undefined;
}

export const createEventExtender = <T extends any>(name: string): EventExtender<T> => {
  const key = Symbol(name);

  return {
    addKey: (event, data) => {
      (event as any)[key] = data;
    },
    getKey: event => (event as any)[key],
  };
};

export const isMac = /mac/i.test(navigator.platform);

export { presets };
