'use client'; 


import { setReconnectSuccess, setSocketConnection, setSocketReconnect } from '@/redux/socketConnectionRedux';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { io, Socket } from 'socket.io-client';


interface SocketContextType {
  socket: Socket | null; 
  isConnected: boolean;  
  reconnect: () => void;
}



const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnect: () => {}
});

interface SocketProviderProps {
  children: ReactNode; 
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

  const dispatch = useDispatch()
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  let reconnectTimes = 0
  const reconnect = useCallback(() => {
    if (socket && !isConnected) { // Chỉ kết nối lại nếu socket tồn tại và hiện đang ngắt kết nối
      dispatch(setSocketReconnect(true))
      console.log('Đang cố gắng kết nối lại Socket.IO ');
      socket.connect(); // Kích hoạt kết nối lại
    } else if (socket && isConnected) {
      console.log('Socket.IO đã được kết nối. Không cần kết nối lại.');
    } else {
      console.log('Socket.IO instance chưa sẵn sàng.');
    }
  }, [socket, isConnected]);


  useEffect(() => {

    const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_IO;
    console.log('Attempting to connect to Socket.IO server at:', SOCKET_SERVER_URL);
 
    const newSocket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,  
      reconnectionDelay: 1000,  
      timeout: 20000            
    });


    newSocket.on('connect', () => {
      console.log('Socket.IO connected. Socket ID:', newSocket.id);
      reconnectTimes = 0
      setIsConnected(true); // Update connection status to true
      dispatch(setSocketConnection(true))
      dispatch(setReconnectSuccess(true))
      dispatch(setSocketReconnect(false))
    });


    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected. Reason:', reason);
      setIsConnected(false); 
      dispatch(setSocketConnection(false))
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      dispatch(setSocketReconnect(true))
      dispatch(setSocketConnection(false))
      reconnectTimes += 1
      console.log('reconnect times', reconnectTimes)
      if(reconnectTimes===6){
        dispatch(setSocketReconnect(false))
        reconnectTimes = 0
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnect attempt:', attemptNumber);
    });


    newSocket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnect error:', error.message);
    });


    newSocket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnect failed. User might need to refresh or check server status.');
      setIsConnected(false); // Ensure connection state reflects failure
    });

    setSocket(newSocket);

    // --- Cleanup Function ---
    // This function runs when the component unmounts (e.g., user navigates away from the page).
    // It's crucial to clean up event listeners and disconnect the socket to prevent memory leaks.
    return () => {
      console.log('Cleaning up: Disconnecting Socket.IO on component unmount.');
      // Remove all specific event listeners to prevent issues if new ones are added
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('reconnect_attempt');
      newSocket.off('reconnect_error');
      newSocket.off('reconnect_failed');
      newSocket.disconnect(); // Explicitly disconnect the socket
    };
  }, []); 

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

