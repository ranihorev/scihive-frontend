import { AxiosError } from 'axios';
import { Group, ContentElement } from '../models';
import * as presets from './presets';

export const getSectionPosition = (section: ContentElement) => ({
  // TODO: handle errors here
  pageNumber: section.coordinates[0].page,
  position: section.coordinates[0].y, // TODO: reverse this
});

export const createEvent = <D extends any>(type: string, details: D) => {
  return new CustomEvent<D>(type, { detail: details });
};

export const createListener = <T extends object>(type: string, cb: (event: CustomEvent<T>) => void) => {
  document.addEventListener(type, cb as EventListener);
  return () => document.removeEventListener(type, cb as EventListener);
};

export const isMac = /mac/i.test(navigator.platform);

export const filterGroups = <T extends Group>(groups: T[], value: string) => {
  return groups.filter(group => new RegExp(`^${value}`, 'i').test(group.name));
};

export const isAxiosError = (e: unknown): e is AxiosError => {
  return e && typeof e === 'object' && e.hasOwnProperty('isAxiosError');
};

export const isValidEmailAddress = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export { presets };
