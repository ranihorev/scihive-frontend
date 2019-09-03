import { actions as categoriesActions } from './categories';
import { actions as userActions } from './user';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { CodeMeta, Section, References, T_Highlight, SidebarTab, Acronyms } from '../models';

export const actions = {
  updateReadingProgress: (payload: number) => {
    return {
      type: 'READING_PROGRESS' as const,
      payload,
    };
  },
  setBookmark: (payload: boolean) => {
    return {
      type: 'SET_BOOKMARK' as const,
      payload,
    };
  },
  setCodeMeta: (payload: CodeMeta) => {
    return {
      type: 'SET_CODE_META' as const,
      payload,
    };
  },
  setDocument: (document: PDFDocumentProxy) => {
    return {
      type: 'SET_DOCUMENT' as const,
      payload: document,
    };
  },

  setSections: (sections: Section[]) => ({
    type: 'SET_SECTIONS' as const,
    payload: sections,
  }),
  setReferences: (references: References) => ({
    type: 'SET_REFERNCES' as const,
    payload: references,
  }),
  clearPaper: () => ({
    type: 'CLEAR_PAPER' as const,
    payload: {},
  }),
  addHighlight: (highlight: T_Highlight) => ({
    type: 'ADD_HIGHLIGHT' as const,
    payload: highlight,
  }),
  setHighlights: (highlights: T_Highlight[]) => ({
    type: 'SET_HIGHLIGHTS' as const,
    payload: highlights,
  }),
  updateHighlight: (highlight: T_Highlight) => ({
    type: 'UPDATE_HIGHLIGHT' as const,
    payload: highlight,
  }),
  removeHighlight: (highlightId: string) => ({
    type: 'REMOVE_HIGHLIGHT' as const,
    payload: highlightId,
  }),
  toggleHighlightsVisiblity: () => ({
    type: 'TOGGLE_HIGHLIGHTS' as const,
    payload: {},
  }),
  setAcronyms: (acronyms: Acronyms) => ({
    type: 'SET_ACRONYMS' as const,
    payload: acronyms,
  }),
  setSidebarTab: (tab: SidebarTab) => ({
    type: 'SET_SIDEBAR_TAB' as const,
    payload: tab,
  }),
  jumpTo: (location: T_Highlight) => ({
    type: 'JUMP_TO' as const,
    payload: location,
  }),
  clearJumpTo: () => ({
    type: 'JUMP_TO' as const,
    payload: {},
  }),
  ...categoriesActions,
  ...userActions,
} as const;

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
