import * as presets from './presets';
import { Section } from '../models';

export const getSectionPosition = (section: Section) => ({
  pageNumber: section.page + 1,
  position: section.transform[section.transform.length - 1] + section.height + 5,
});

export { presets };
