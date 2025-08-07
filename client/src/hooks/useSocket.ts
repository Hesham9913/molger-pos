import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId: string, branchId: string, role: string) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = (userId: string, branchId: string, role: string) => {
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
    // In production, use the same origin as the app, in development use localhost
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: true,
      timeout: 5000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Authenticate with server
      newSocket.emit('authenticate', {
        userId,
        branchId,
        role,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      
      // Re-authenticate after reconnection
      newSocket.emit('authenticate', {
        userId,
        branchId,
        role,
      });
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
  };
}; 