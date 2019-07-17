import * as presets from './presets';

export const getSectionPosition = section => ({
  pageNumber: section.page + 1,
  position: section.transform[section.transform.length - 1] + section.height + 5,
});

export { presets };
