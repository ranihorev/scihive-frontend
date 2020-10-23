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

export interface T_NewHighlight {
  position: T_ScaledPosition;
  highlighted_text: string;
  text: string;
  visibility: Visibility;
}

export interface NewGeneralHighlight {
  text: string;
  visibility: Visibility;
  isGeneral: true;
}

export interface ReplyProps {
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
  replies: ReplyProps[];
  username: User;
  canEdit: boolean;
  isGeneral: boolean;
}

export interface T_Highlight extends T_NewHighlight, ServerHighlightData {}
export interface GeneralHighlight extends NewGeneralHighlight, Omit<ServerHighlightData, 'isGeneral'> {}
export type AllHighlight = T_Highlight | GeneralHighlight;
export type AllNewHighlight = T_NewHighlight | NewGeneralHighlight;

export const isGeneralHighlight = (h: AllHighlight): h is GeneralHighlight => h.isGeneral;
export const isDirectHighlight = (h: AllHighlight): h is T_Highlight => h.hasOwnProperty('position');

export interface TempHighlight extends Pick<T_NewHighlight, 'position' | 'highlighted_text'> {
  size: { left: number; top: number; bottom: number };
}

export interface EditHighlightData {
  text: string;
  visibility: Visibility;
}

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

export interface BasePaperData {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  time_published: string;
  doi?: string;
}

export interface PapersListRequestParams {
  age: string;
  q: string;
  sort: SortBy;
  author: string;
  page_num: number;
  group: string;
  library: boolean;
}

export interface PaperListItem extends BasePaperData {
  comments_count: number;
  twitter_score: number;
  twitter_links?: TwitterLink[];
  num_stars: number;
  code?: CodeMeta;
  groups: string[];
}

export interface PaperListResponse {
  papers: PaperListItem[];
  count: number;
  hasMore: boolean;
}

export interface Author {
  name: string;
  id?: string;
}

export interface FileMetadata extends Omit<BasePaperData, 'id' | 'time_published'> {
  date: string;
  removed_authors?: string[];
}

const SORT_BY = ['tweets', 'date', 'score', 'bookmarks', 'date_added'] as const;

export type SortBy = typeof SORT_BY[number];

export const isValidSort = (sort: string | undefined): sort is SortBy => {
  return typeof sort === 'string' && SORT_BY.includes(sort as any);
};
