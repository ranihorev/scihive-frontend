import { T_LTWH } from '../../models';
import optimizeClientRects from './optimize-client-rects';

const PAGE_THRESHOLD = 1;

const getClientRects = (range: Range, containerEl: HTMLElement, shouldOptimize: boolean = true): T_LTWH[] => {
  let clientRects = Array.from(range.getClientRects());

  const containerBounds = containerEl.getBoundingClientRect();

  const rects = clientRects
    .map(rect => {
      return {
        top: rect.top + containerEl.scrollTop - containerBounds.top,
        left: rect.left + containerEl.scrollLeft - containerBounds.left,
        width: rect.width,
        height: rect.height,
      };
    })
    // We assume that rectangles that are too closed to the edge of the page are "ghost" selections and we ignore them
    .filter(rect => rect.left > PAGE_THRESHOLD && rect.left + rect.width < containerBounds.width - PAGE_THRESHOLD);

  return shouldOptimize ? optimizeClientRects(rects) : rects;
};

export default getClientRects;
