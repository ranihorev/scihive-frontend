// "viewport" rectangle is { top, left, width, height }
// "scaled" means that data structure stores (0, 1) coordinates.
// for clarity reasons I decided not to store actual (0, 1) coordinates, but
// provide width and height, so user can compute ratio himself if needed

import { T_LTWH, T_Position, T_Scaled, T_ScaledPosition } from '../../models';

interface T_VIEWPORT {
  convertToPdfPoint: (x: number, y: number) => Array<number>;
  convertToViewportRectangle: (pdfRectangle: Array<number>) => Array<number>;
  width: number;
  height: number;
}

type WIDTH_HEIGHT = { width: number; height: number };

export const viewportRectToScaled = (rect: T_LTWH, { width, height }: WIDTH_HEIGHT): T_Scaled => {
  return {
    x1: rect.left,
    y1: rect.top,

    x2: rect.left + rect.width,
    y2: rect.top + rect.height,

    width,
    height,
  };
};

export const scaledRectToViewport = (scaled: T_Scaled, viewport: T_VIEWPORT): T_LTWH => {
  const { width, height } = viewport;

  const x1 = (width * scaled.x1) / scaled.width;
  const y1 = (height * scaled.y1) / scaled.height;

  const x2 = (width * scaled.x2) / scaled.width;
  const y2 = (height * scaled.y2) / scaled.height;

  return {
    left: x1,
    top: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
};

// TODO: replace with proper type
export const viewportPositionToScaled = (
  viewer: React.MutableRefObject<any>,
  { pageNumber, boundingRect, rects }: T_Position,
) => {
  const { viewport } = viewer.current.getPageView(pageNumber - 1);

  return {
    boundingRect: viewportRectToScaled(boundingRect, viewport),
    rects: (rects || []).map(rect => viewportRectToScaled(rect, viewport)),
    pageNumber,
  };
};

export const scaledPositionToViewport = (
  viewer: React.MutableRefObject<any>,
  { pageNumber, boundingRect, rects }: T_ScaledPosition,
) => {
  const { viewport } = viewer.current.getPageView(pageNumber - 1);
  return {
    boundingRect: scaledRectToViewport(boundingRect, viewport),
    rects: (rects || []).map(rect => scaledRectToViewport(rect, viewport)),
    pageNumber,
  };
};
