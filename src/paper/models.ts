import { BasePaperData, T_Highlight } from '../models';

export type LoadStatus =
  | { state: 'FetchingURL' | 'DownloadingPdf' | 'Ready' }
  | { state: 'Error'; reason: string; code?: number };
export type LoadStatusState = LoadStatus['state'];

export type CommentEvent = { type: 'new' | 'update'; data: T_Highlight } | { type: 'delete'; id: string };

export type MetaDataUpdateEvent = { success: boolean; data?: BasePaperData };
