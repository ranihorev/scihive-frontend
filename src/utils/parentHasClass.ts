const hasClass = (element: HTMLElement, className: string) => {
  return element.classList.contains(className);
};

export const hasClassInTree = (element: HTMLElement, className: string): boolean => {
  if (!element.parentElement) {
    return false;
  }

  if (hasClass(element, className)) {
    return true;
  }

  return hasClassInTree(element.parentElement, className);
};
