import Axios from 'axios';
import { pick } from 'lodash';
import React from 'react';
import { useQuery } from 'react-query';
import { Socket } from 'socket.io-client';
import shallow from 'zustand/shallow';
import { FetchPaperResponse, usePaperStore } from '../stores/paper';
import { useToken } from '../utils/hooks';
import { useSocket } from '../utils/SocketContext';
import { CommentEvent, MetaDataUpdateEvent } from './models';

const useCreateSocketListener = () => {
  const socket = useSocket();
  // We want to keep this function stable
  const createListener = React.useMemo(() => {
    return (...args: Parameters<Socket['on']>) => {
      socket.on(...args);
      return () => socket.off(...args);
    };
  }, [socket]);
  return createListener;
};

export const useCommentsSocket = () => {
  const socket = useSocket();
  const createListener = useCreateSocketListener();
  const { onCommentEvent, id: paperId } = usePaperStore(state => pick(state, ['id', 'onCommentEvent']), shallow);
  const token = useToken();

  React.useEffect(() => {
    if (!paperId) return () => {};
    const joinRoom = () => socket.emit('join', { paperId, token });
    if (socket.connected) {
      joinRoom();
    }
    const onComment = (event: CommentEvent) => {
      onCommentEvent(event);
    };

    const listeners: (() => void)[] = [];
    listeners.push(createListener('reconnect', joinRoom));
    listeners.push(createListener('comment', onComment));

    return () => {
      socket.emit('leave', { paperId });
      listeners.forEach(fn => fn());
    };
  }, [socket, paperId, createListener, onCommentEvent, token]);
};

export const useFetchMetadata = () => {
  const socket = useSocket();
  const createListener = useCreateSocketListener();
  const { updateMetadata, id: paperId, metadataState } = usePaperStore(
    state => pick(state, ['id', 'updateMetadata', 'metadataState']),
    shallow,
  );
  const token = useToken();

  useQuery(
    ['FetchMetadata', { paperId }],
    async () => {
      const response = await Axios.get<Omit<FetchPaperResponse, 'groups'>>(`/paper/${paperId}/metadata`);
      if (response.data.metadataState !== 'Ready') return undefined;
      updateMetadata(response.data);
      return response.data;
    },
    { refetchIntervalInBackground: true, refetchInterval: 5000, enabled: metadataState !== 'Ready' },
  );

  React.useEffect(() => {
    if (!paperId || metadataState === 'Ready') return () => {};
    const onMetaDataUpdate = (response: MetaDataUpdateEvent) => {
      if (response.success && response.data) {
        updateMetadata(response.data);
      }
    };
    return createListener('paperInfo', onMetaDataUpdate);
  }, [socket, paperId, createListener, updateMetadata, token, metadataState]);
};
