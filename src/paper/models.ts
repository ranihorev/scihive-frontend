import { T_Highlight } from '../models';

export type LoadStatus = { state: 'FetchingURL' | 'DownloadingPdf' | 'Ready' } | { state: 'Error'; reason: string };
export type LoadStatusState = LoadStatus['state'];

export type CommentEvent = { type: 'new' | 'update'; data: T_Highlight } | { type: 'delete'; id: string };
