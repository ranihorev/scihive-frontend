import { pick } from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { usePaperStore } from '../stores/paper';
import { useToken } from '../utils/hooks';
import { useSocket } from '../utils/SocketContext';
import { CommentEvent, MetaDataUpdateEvent } from './models';

const useCreateSocketListener = () => {
  const socket = useSocket();
  // We want to keep this function stable
  const createListener = React.useMemo(() => {
    return (...args: Parameters<SocketIOClient.Emitter['on']>) => {
      socket.on(...args);
      return () => socket.off(...args);
    };
  }, [socket]);
  return createListener;
};

export const useCommentsSocket = (paperId: string) => {
  const socket = useSocket();
  const createListener = useCreateSocketListener();
  const { onCommentEvent, updateMetadata } = usePaperStore(
    state => pick(state, ['onCommentEvent', 'updateMetadata']),
    shallow,
  );
  const token = useToken();

  React.useEffect(() => {
    const joinRoom = () => socket.emit('join', { paperId, token });
    if (socket.connected) {
      joinRoom();
    }
    const onComment = (event: CommentEvent) => {
      onCommentEvent(event);
    };

    const onMetaDataUpdate = (response: MetaDataUpdateEvent) => {
      if (response.success && response.data) {
        updateMetadata(response.data);
      }
    };

    const listeners: (() => void)[] = [];
    listeners.push(createListener('reconnect', joinRoom));
    listeners.push(createListener('comment', onComment));
    listeners.push(createListener('paperInfo', onMetaDataUpdate));

    return () => {
      socket.emit('leave', { paperId });
      listeners.forEach(fn => fn());
    };
  }, [socket, paperId, createListener, onCommentEvent, updateMetadata, token]);
};
