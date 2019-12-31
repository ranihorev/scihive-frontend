import { PDFDocumentProxy } from 'pdfjs-dist';
import { createAction } from 'typesafe-actions';
import { CodeMeta, Section, References, T_Highlight, SidebarTab, Acronyms, JumpToData, Visibility } from '../models';

export const actions = {
  updateReadingProgress: createAction('updateReadingProgress')<number>(),
  setBookmark: createAction('setBookmark')<boolean>(),
  setCodeMeta: createAction('setCodeMeta')<CodeMeta>(),
  setDocument: createAction('setDocument')<PDFDocumentProxy>(),
  addRemoveGroupIds: createAction('addRemoveGroupIds')<{ groupIds: string[]; shouldAdd: boolean }>(),
  setSections: createAction('setSections')<Section[]>(),
  setReferences: createAction('setReferences')<References>(),
  clearPaper: createAction('clearPaper')(),
  addHighlight: createAction('addHighlight')<T_Highlight>(),
  setHighlights: createAction('setHighlights')<T_Highlight[]>(),
  updateHighlight: createAction('updateHighlight')<T_Highlight>(),
  removeHighlight: createAction('removeHighlight')<string>(),
  toggleHighlightsVisiblity: createAction('toggleHighlightsVisiblity')(),
  setAcronyms: createAction('setAcronyms')<Acronyms>(),
  setSidebarTab: createAction('setSidebarTab')<SidebarTab>(),
  jumpTo: createAction('jumpTo')<JumpToData>(),
  clearJumpTo: createAction('clearJumpTo')(),
  setCommentVisibilitySettings: createAction('setCommentVisibilitySettings')<Visibility>(),
};

export type PaperActionKeys = keyof typeof actions;
export type PaperActions = ReturnType<typeof actions[keyof typeof actions]>;
export type PaperAction<T extends PaperActionKeys> = ReturnType<typeof actions[T]>;
