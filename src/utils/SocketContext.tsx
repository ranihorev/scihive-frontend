import React from 'react';
import io from 'socket.io-client';

export class SocketManager {
  public socket: SocketIOClient.Socket;
  constructor(host: string) {
    this.socket = io(host, { reconnectionDelay: 2000, transports: ['websocket'] });
    this.socket.on('disconnect', () => {
      console.warn('Disconnected');
    });
    this.socket.on('reconnect', () => {
      console.info('Reconnected');
    });
  }
}

export const SocketContext = React.createContext<SocketManager | undefined>(undefined);

export const SocketProvider: React.FC = ({ children }) => {
  const socketRef = React.useRef<SocketManager>();
  if (!socketRef.current) {
    if (!process.env.REACT_APP_BASE_URL) {
      console.warn('BASE_URL is missing! Websocket will not working');
    }
    socketRef.current = new SocketManager(process.env.REACT_APP_BASE_URL || '');
  }
  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const socket = React.useContext(SocketContext);
  if (socket === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket.socket;
};
