import React, { createContext, useContext, useState, useEffect } from 'react';
import SocketService from '../utils/socket';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext();

/**
 * Provider component for socket connectivity
 * Manages socket connection and provides socket status
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const SocketProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Initialize connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Connect to Socket.IO server
      SocketService.connect();
      
      // Set up event listeners
      const handleConnect = () => {
        console.log('Socket connected');
        setConnected(true);
        setConnectionStatus('connected');
      };
      
      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setConnected(false);
        setConnectionStatus('disconnected');
      };
      
      const handleConnectError = (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
        setConnectionStatus('error');
      };
      
      const handleReconnecting = (attemptNumber) => {
        console.log(`Socket reconnecting (attempt ${attemptNumber})`);
        setConnectionStatus('reconnecting');
      };
      
      // Add event listeners
      SocketService.on('connect', handleConnect);
      SocketService.on('disconnect', handleDisconnect);
      SocketService.on('connect_error', handleConnectError);
      SocketService.on('reconnecting', handleReconnecting);
      
      // Clean up on unmount
      return () => {
        SocketService.off('connect', handleConnect);
        SocketService.off('disconnect', handleDisconnect);
        SocketService.off('connect_error', handleConnectError);
        SocketService.off('reconnecting', handleReconnecting);
        
        // Only disconnect if we're authenticated (this prevents multiple connections/disconnections)
        if (isAuthenticated) {
          SocketService.disconnect();
        }
      };
    } else {
      // If not authenticated, ensure we're disconnected
      SocketService.disconnect();
      setConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated]);
  
  // Reconnect when user changes
  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      // Disconnect and reconnect when user changes
      SocketService.disconnect();
      SocketService.connect();
    }
  }, [currentUser?.id, isAuthenticated]);
  
  // Value provided by the context
  const value = {
    connected,
    connectionStatus,
    socketService: SocketService
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 