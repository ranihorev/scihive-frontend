export const getPageFromElement = (target: HTMLElement) => {
  const node = target.closest('.page');

  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const number = Number(node.dataset.pageNumber);

  return { node, number };
};

export const getPageFromRange = (range: Range) => {
  const parentElement = range.startContainer.parentElement;

  if (!(parentElement instanceof HTMLElement)) {
    return;
  }

  return getPageFromElement(parentElement);
};

export const getElementFromRange = (range: Range, className: string): HTMLElement | null => {
  const parentElement = range.startContainer.parentElement;

  if (!(parentElement instanceof HTMLElement)) {
    return null;
  }
  const node = parentElement.closest(`.${className}`);

  if (!(node instanceof HTMLElement)) {
    return null;
  }
  return node;
};

export const findOrCreateContainerLayer = (container: HTMLElement, className: string) => {
  let layer = container.querySelector(`.${className}`);

  if (!layer) {
    layer = document.createElement('div');
    layer.className = className;
    container.appendChild(layer);
  }

  return layer;
};

// TODO: replace viewer type with the proper type from pdfjs
export const findOrCreateLayer = (viewer: React.MutableRefObject<any>, page: number, layerName: string) => {
  const { annotationLayer } = viewer.current.getPageView(page - 1);
  if (!annotationLayer) return null;
  return findOrCreateContainerLayer(annotationLayer.pageDiv, layerName);
};
