export interface T_LTWH {
  left: number,
  top: number,
  width: number,
  height: number
};

export interface T_Scaled {
  x1: number,
  y1: number,

  x2: number,
  y2: number,

  width: number,
  height: number
}

export interface T_Position {
  boundingRect: T_LTWH,
  rects: T_LTWH[],
  pageNumber: number
}

export interface T_ScaledPosition {
  boundingRect: T_Scaled,
  rects: T_Scaled[],
  pageNumber: number,
  usePdfCoordinates?: boolean
}

export interface T_NewHighlight {
  position: T_ScaledPosition;
  content: {
    text?: string,
    image?: string
  };
  comment: {
    text: string
  };
}

export interface T_Highlight extends T_NewHighlight {
  id: string;
}

// export interface T_ViewportHighlight extends T_Highlight {
//   position: T_Position
// };

export interface T_VIEWPORT {
  convertToPdfPoint: (x: number, y: number) => Array<number>;
  convertToViewportRectangle: (pdfRectangle: Array<number>) => Array<number>;
  width: number;
  height: number;
}

export interface TipObject {
  highlight: T_Highlight;
  callback: (h: T_Highlight) => void;
}

export type Acronym = { [pageIdx: number]: number[] }
export type Acronyms = { [key: string]: Acronym }
