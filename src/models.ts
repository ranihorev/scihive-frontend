import { TextContentItem } from 'pdfjs-dist';
import { GroupColor } from './utils/presets';

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>;

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

export interface NewGeneralHighlight {
  comment: {
    text: string;
  };
  visibility: Visibility;
  isGeneral: true;
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

interface ServerHighlightData {
  id: string;
  createdAt: string;
  replies: Reply[];
  user: User;
  canEdit: boolean;
}

export interface T_Highlight extends T_NewHighlight, ServerHighlightData {}
export interface GeneralHighlight extends NewGeneralHighlight, ServerHighlightData {}
export type AllHighlight = T_Highlight | GeneralHighlight;
export type AllNewHighlight = T_NewHighlight | NewGeneralHighlight;

export const isGeneralHighlight = (h: AllHighlight): h is GeneralHighlight => h.hasOwnProperty('isGeneral');
export const isDirectHighlight = (h: AllHighlight): h is T_Highlight => h.hasOwnProperty('position');

export interface TooltipData {
  position: T_ScaledPosition;
  content: T_NewHighlight['content'];
  size: { left: number; top: number; bottom: number };
}

export interface EditHighlightData {
  text: string;
  visibility: Visibility;
}

export type TempHighlight = OptionalExceptFor<T_NewHighlight, 'position'>;

export type T_ExtendedHighlight = T_Highlight | TempHighlight;

export const isValidHighlight = (highlight: T_Highlight | TempHighlight): highlight is T_Highlight => {
  return highlight.hasOwnProperty('id');
};

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
  color?: GroupColor;
  num_papers: number;
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

export const SIDEBAR_TABS = ['Sections', 'Comments', 'Info'] as const;
export type SidebarTab = typeof SIDEBAR_TABS[number];

export interface SidebarCommentJump {
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

export type PaperJump = SectionPaperJump | HighlightPaperJump;

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

export interface PaperListRouterParams {
  authorId?: string;
  groupId?: string;
}

interface Author {
  name: string;
}

export interface FileMetadata {
  md5: string;
  title: string;
  abstract: string;
  authors: Author[];
  date: string;
}
