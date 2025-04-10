import io from 'socket.io-client';

// Socket.IO server URL - should be the same as your backend API
const SOCKET_URL = 'http://localhost:5002';

// Socket events
export const SOCKET_EVENTS = {
  EMPLOYEE_CREATED: 'employee-created',
  EMPLOYEE_UPDATED: 'employee-updated',
  EMPLOYEE_DELETED: 'employee-deleted',
  BIOMETRIC_STATUS_UPDATED: 'biometric-status-updated',
  BIOMETRIC_VALIDATED: 'biometric-validated',
  BIOMETRIC_SCAN_COMPLETED: 'biometric-scan-completed',
  ATTENDANCE_RECORDED: 'attendance-recorded',
  ATTENDANCE_UPDATED: 'attendance-updated'
};

// Create a singleton socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually when needed
  reconnectionAttempts: 5,
  timeout: 10000
});

/**
 * Socket utility for managing the connection and event handling
 */
const SocketService = {
  /**
   * Connect to the Socket.IO server
   */
  connect: () => {
    if (!socket.connected) {
      socket.connect();
      console.log('Socket.IO: Attempting connection...');
    }
  },

  /**
   * Disconnect from the Socket.IO server
   */
  disconnect: () => {
    if (socket.connected) {
      socket.disconnect();
      console.log('Socket.IO: Disconnected');
    }
  },

  /**
   * Check if socket is connected
   * @returns {boolean} - Connection status
   */
  isConnected: () => {
    return socket.connected;
  },

  /**
   * Subscribe to an event
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is received
   */
  on: (event, callback) => {
    socket.on(event, callback);
  },

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name to stop listening for
   * @param {Function} callback - Original callback function (optional)
   */
  off: (event, callback) => {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  },

  /**
   * Emit an event to the server
   * @param {string} event - Event name to emit
   * @param {any} data - Data to send with the event
   */
  emit: (event, data) => {
    socket.emit(event, data);
  },

  /**
   * Get the socket instance
   * @returns {Socket} - The socket.io instance
   */
  getSocket: () => {
    return socket;
  }
};

export default SocketService; 