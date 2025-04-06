// Enhanced WebSocket implementation for Cloudflare Workers
// Provides rooms, events, and better connection management

// Event types
export const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  MESSAGE: 'message',
  ATTENDANCE_UPDATE: 'attendance_update',
  BIOMETRIC_UPDATE: 'biometric_update',
  EMPLOYEE_UPDATE: 'employee_update',
  ERROR: 'error'
};

// WebSocket connection manager (Durable Object)
export class ConnectionsObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    
    // Store session data
    this.sessions = new Map(); // sessionId -> WebSocket
    this.sessionData = new Map(); // sessionId -> SessionData
    
    // Store room data
    this.rooms = new Map(); // roomName -> Set of sessionIds
    this.sessionRooms = new Map(); // sessionId -> Set of roomNames
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle WebSocket connection endpoint
    if (url.pathname === '/api/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }
      
      // Create WebSocket pair
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      
      // Handle the WebSocket session
      await this.handleSession(server, url);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    
    // Handle HTTP endpoints for WebSocket management
    if (url.pathname === '/api/ws/status') {
      return new Response(JSON.stringify({
        status: 'ok',
        connections: this.sessions.size,
        rooms: [...this.rooms.keys()].map(roomName => ({
          name: roomName,
          members: this.rooms.get(roomName).size
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }

  // Handle a new WebSocket session
  async handleSession(webSocket, url) {
    // Accept the WebSocket connection
    webSocket.accept();
    
    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    
    // Parse query parameters
    const params = url.searchParams;
    const userId = params.get('userId');
    const userRole = params.get('userRole');
    const initialRoom = params.get('room');
    
    // Store session data
    this.sessions.set(sessionId, webSocket);
    this.sessionData.set(sessionId, {
      id: sessionId,
      userId,
      userRole,
      connectedAt: new Date().toISOString(),
      ip: null, // Could be populated from request if available
    });
    
    // Initialize session rooms
    this.sessionRooms.set(sessionId, new Set());
    
    // Join initial room if specified
    if (initialRoom) {
      this.joinRoom(sessionId, initialRoom);
    }
    
    // Message handler
    webSocket.addEventListener('message', async (message) => {
      try {
        let data;
        try {
          data = JSON.parse(message.data);
        } catch (e) {
          throw new Error('Invalid JSON message');
        }
        
        const { type, payload } = data;
        
        switch (type) {
          case EVENTS.JOIN_ROOM:
            if (typeof payload.room !== 'string') {
              throw new Error('Room name must be a string');
            }
            this.joinRoom(sessionId, payload.room);
            webSocket.send(JSON.stringify({
              type: EVENTS.JOIN_ROOM,
              payload: { room: payload.room, success: true }
            }));
            break;
            
          case EVENTS.LEAVE_ROOM:
            if (typeof payload.room !== 'string') {
              throw new Error('Room name must be a string');
            }
            this.leaveRoom(sessionId, payload.room);
            webSocket.send(JSON.stringify({
              type: EVENTS.LEAVE_ROOM,
              payload: { room: payload.room, success: true }
            }));
            break;
          
          case EVENTS.MESSAGE:
            if (!payload.room) {
              // Broadcast to all connected clients
              this.broadcast({
                type: EVENTS.MESSAGE,
                payload: {
                  ...payload,
                  from: sessionId,
                  timestamp: new Date().toISOString()
                }
              });
            } else {
              // Send to specific room
              this.sendToRoom(payload.room, {
                type: EVENTS.MESSAGE,
                payload: {
                  ...payload,
                  from: sessionId,
                  timestamp: new Date().toISOString()
                }
              });
            }
            break;
            
          default:
            // Handle custom events (forward to appropriate room)
            if (payload.room) {
              this.sendToRoom(payload.room, {
                type,
                payload: {
                  ...payload,
                  from: sessionId,
                  timestamp: new Date().toISOString()
                }
              });
            } else {
              // For certain events, we may want to broadcast to specific rooms
              if ([
                EVENTS.ATTENDANCE_UPDATE,
                EVENTS.BIOMETRIC_UPDATE,
                EVENTS.EMPLOYEE_UPDATE
              ].includes(type)) {
                // Broadcast to admin room
                this.sendToRoom('admin', {
                  type,
                  payload: {
                    ...payload,
                    from: sessionId,
                    timestamp: new Date().toISOString()
                  }
                });
                
                // If there's a specific department/team ID, send to that room too
                if (payload.departmentId) {
                  this.sendToRoom(`department:${payload.departmentId}`, {
                    type,
                    payload: {
                      ...payload,
                      from: sessionId,
                      timestamp: new Date().toISOString()
                    }
                  });
                }
              }
            }
        }
      } catch (error) {
        // Send error message back to client
        webSocket.send(JSON.stringify({
          type: EVENTS.ERROR,
          payload: {
            error: error.message,
            timestamp: new Date().toISOString()
          }
        }));
      }
    });
    
    // Close handler
    webSocket.addEventListener('close', () => {
      this.handleDisconnect(sessionId);
    });
    
    // Error handler
    webSocket.addEventListener('error', () => {
      this.handleDisconnect(sessionId);
    });
    
    // Send connected confirmation
    webSocket.send(JSON.stringify({
      type: EVENTS.CONNECT,
      payload: {
        sessionId,
        userId,
        userRole,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Notify admin room of new connection
    this.sendToRoom('admin', {
      type: EVENTS.CONNECT,
      payload: {
        sessionId,
        userId,
        userRole,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Join a room
  joinRoom(sessionId, roomName) {
    // Get the session's WebSocket
    const webSocket = this.sessions.get(sessionId);
    if (!webSocket) return false;
    
    // Create room if it doesn't exist
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    
    // Add session to room
    this.rooms.get(roomName).add(sessionId);
    
    // Add room to session's rooms
    this.sessionRooms.get(sessionId).add(roomName);
    
    // Notify room of new member
    this.sendToRoom(roomName, {
      type: EVENTS.JOIN_ROOM,
      payload: {
        sessionId,
        room: roomName,
        timestamp: new Date().toISOString()
      }
    }, [sessionId]); // Don't send to the joining session
    
    return true;
  }
  
  // Leave a room
  leaveRoom(sessionId, roomName) {
    // Get session's WebSocket
    const webSocket = this.sessions.get(sessionId);
    if (!webSocket) return false;
    
    // Check if room exists
    if (!this.rooms.has(roomName)) return false;
    
    // Remove session from room
    this.rooms.get(roomName).delete(sessionId);
    
    // If room is empty, remove it
    if (this.rooms.get(roomName).size === 0) {
      this.rooms.delete(roomName);
    }
    
    // Remove room from session's rooms
    this.sessionRooms.get(sessionId).delete(roomName);
    
    // Notify room of member leaving
    this.sendToRoom(roomName, {
      type: EVENTS.LEAVE_ROOM,
      payload: {
        sessionId,
        room: roomName,
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  }
  
  // Handle session disconnect
  handleDisconnect(sessionId) {
    // Get session data
    const sessionData = this.sessionData.get(sessionId);
    if (!sessionData) return;
    
    // Get session rooms
    const rooms = this.sessionRooms.get(sessionId);
    if (rooms) {
      // Leave all rooms
      for (const roomName of rooms) {
        this.leaveRoom(sessionId, roomName);
      }
      
      // Clean up session rooms
      this.sessionRooms.delete(sessionId);
    }
    
    // Remove session
    this.sessions.delete(sessionId);
    this.sessionData.delete(sessionId);
    
    // Notify admin room of disconnect
    this.sendToRoom('admin', {
      type: EVENTS.DISCONNECT,
      payload: {
        sessionId,
        userId: sessionData.userId,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Send message to all sessions in a room
  sendToRoom(roomName, message, excludeSessionIds = []) {
    // Check if room exists
    if (!this.rooms.has(roomName)) return;
    
    // Get session IDs in room
    const sessionIds = this.rooms.get(roomName);
    
    // Send message to each session in room
    const messageStr = JSON.stringify(message);
    for (const sessionId of sessionIds) {
      // Skip excluded sessions
      if (excludeSessionIds.includes(sessionId)) continue;
      
      const webSocket = this.sessions.get(sessionId);
      if (webSocket && webSocket.readyState === 1) { // 1 = OPEN
        webSocket.send(messageStr);
      }
    }
  }
  
  // Broadcast message to all connected sessions
  broadcast(message, excludeSessionIds = []) {
    const messageStr = JSON.stringify(message);
    
    for (const [sessionId, webSocket] of this.sessions.entries()) {
      // Skip excluded sessions
      if (excludeSessionIds.includes(sessionId)) continue;
      
      if (webSocket.readyState === 1) { // 1 = OPEN
        webSocket.send(messageStr);
      }
    }
  }
}

// Client-side helper to connect to WebSocket
export function createWebSocketURL(params = {}) {
  const { protocol, host } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams.set(key, value);
    }
  }
  
  const queryString = queryParams.toString();
  return `${wsProtocol}//${host}/api/ws${queryString ? '?' + queryString : ''}`;
} 