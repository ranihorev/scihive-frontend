export interface T_LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface T_Scaled {
  x1: number;
  y1: number;

  x2: number;
  y2: number;

  width: number;
  height: number;
}

export interface T_ScaledPosition {
  boundingRect: T_Scaled;
  rects: T_Scaled[];
  pageNumber: number;
  usePdfCoordinates?: boolean;
}

export interface T_NewHighlight {
  position: T_ScaledPosition;
  content: {
    text?: string;
    image?: string;
  };
  comment: {
    text: string;
  };
}

export interface T_Highlight extends T_NewHighlight {
  id: string;
}

export type Acronym = { [pageIdx: number]: number[] };
export type Acronyms = { [key: string]: Acronym };

export interface Category {
  key: string;
  value: string;
}

export interface CodeMeta {
  github: string;
  stars: number;
  paperswithcode: string;
}

export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface Section {
  height: number;
  str: string;
  fontName: string;
  page: number;
}

export interface Reference {
  html: string;
  arxivId: string;
}

export interface References {
  [citeId: string]: Reference;
}

export type SidebarTab = 'Sections' | 'Comments';

export interface RootState {
  user: {
    isLoginModalOpen: boolean;
    isGroupsModalOpen: boolean;
    userData?: {
      username: string;
    };
    loginModalMessage?: string;
    blinkLibraryState: boolean;
    groups?: Group[];
    selectedGroup?: Group;
  };
  paper: {
    readingProgress: number;
    isBookmarked: boolean;
    document?: any;
    sections?: any[];
    references: References;
    highlights: T_Highlight[];
    hiddenHighlights: any[];
    acronyms: {};
    sidebarTab: SidebarTab;
    jumpData: {};
    codeMeta?: CodeMeta;
  };
  papersList: {
    allCategories: Category[];
    selectedCategories: string[];
    isCategoriesModalOpen: boolean;
  };
}
