import React from 'react';
import { useSocket } from '../utils/SocketContext';
import { CommentEvent, LoadStatusState } from './models';
import { usePaperStore } from '../stores/paper';

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

export const useCommentsSocket = (paperId: string, status: LoadStatusState, token?: string) => {
  const socket = useSocket();
  const createListener = useCreateSocketListener();
  const onCommentEventHandler = usePaperStore(state => state.onCommentEvent);

  React.useEffect(() => {
    if (status !== 'Ready') return () => {};
    const joinRoom = () => socket.emit('join', { paperId, token });
    if (socket.connected) {
      joinRoom();
    }
    const onComment = (event: CommentEvent) => {
      onCommentEventHandler(event);
    };

    const listeners: (() => void)[] = [];
    listeners.push(createListener('reconnect', joinRoom));
    listeners.push(createListener('comment', onComment));

    return () => {
      socket.emit('leave', { paperId });
      listeners.forEach(fn => fn());
    };
  }, [status, socket, paperId, createListener, onCommentEventHandler, token]);
};
