import { PDFDocumentProxy, TextContentItem } from 'pdfjs-dist';
import { RouteComponentProps } from 'react-router';

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

export interface T_Position {
  pageNumber: number;
  boundingRect: T_LTWH;
  rects: T_LTWH[];
}

export interface T_ScaledPosition {
  boundingRect: T_Scaled;
  rects: T_Scaled[];
  pageNumber: number;
  usePdfCoordinates?: boolean;
}

export interface SimplePosition {
  pageNumber: number;
  position: number;
}

export const VISIBILITIES = ['public', 'private', 'anonymous', 'group'] as const;
export type VisibilityType = typeof VISIBILITIES[number];

export interface Visibility {
  type: VisibilityType;
  id?: string;
}

export interface T_NewHighlight<P extends T_ScaledPosition | T_Position = T_ScaledPosition> {
  position: P;
  content: {
    text?: string;
    image?: string;
  };
  comment: {
    text: string;
  };
  visibility: Visibility;
}

export interface Reply {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface User {
  username: string;
}

export interface T_Highlight extends T_NewHighlight {
  id: string;
  createdAt: string;
  replies: Reply[];
  user: User;
  canEdit: boolean;
  visibility: Visibility;
}

export type TempHighlight = OptionalExceptFor<T_NewHighlight, 'position'>;

export const isValidHighlight = (highlight: T_Highlight | TempHighlight): highlight is T_Highlight => {
  return highlight.hasOwnProperty('id');
};

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>;

export interface TipObject {
  highlight: T_Highlight;
  callback: (h: T_Highlight) => void;
}

export interface Acronyms {
  [key: string]: string;
}
export interface AcronymPositions {
  [key: string]: {
    [pageNumber: number]: number[];
  };
}

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

export interface Section extends TextContentItem {
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

interface CommentJump {
  id: string;
  type: 'comment';
  area: 'sidebar';
}

interface BasePaperJump {
  id: string;
  area: 'paper';
}

interface SectionPaperJump extends BasePaperJump {
  type: 'section';
  location: SimplePosition;
}

interface HighlightPaperJump extends BasePaperJump {
  type: 'highlight';
  location: T_ScaledPosition;
}

export type PaperIdParams = RouteComponentProps<{ PaperId: string }>['match'];

type PaperJump = SectionPaperJump | HighlightPaperJump;

export type JumpToData = PaperJump | CommentJump;

export interface TwitterLink {
  link: string;
  name: string;
  score: number;
}

export interface PaperListItem {
  _id: string;
  saved_in_library: boolean;
  comments_count: number;
  twtr_score: number;
  twtr_links: TwitterLink[];
  bookmarks_count: number;
  github: CodeMeta;
  title: string;
  authors: { name: string }[];
  time_published: string;
  summary: string;
  groups: string[];
}

export interface RootState {
  user: {
    isLoginModalOpen: boolean;
    isGroupsModalOpen: boolean;
    userData?: User;
    loginModalMessage?: string;
    groups: Group[];
  };
  paper: {
    readingProgress: number;
    isBookmarked: boolean;
    document?: PDFDocumentProxy;
    sections?: Section[];
    references: References;
    highlights: T_Highlight[];
    hiddenHighlights: T_Highlight[];
    acronyms: {};
    sidebarTab: SidebarTab;
    jumpData?: JumpToData;
    codeMeta?: CodeMeta;
    groupIds: string[];
    commentVisibilty: Visibility;
  };
  papersList: {
    papers: PaperListItem[];
    totalPapers: number;
    allCategories: Category[];
    selectedCategories: string[];
    isCategoriesModalOpen: boolean;
  };
}
