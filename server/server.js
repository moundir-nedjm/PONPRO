const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employee.routes');
const biometricRoutes = require('./routes/biometric.routes');
const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const documentRoutes = require('./routes/document.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const attendanceCodeRoutes = require('./routes/attendance-code.routes');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005", "http://localhost:5000", "http://localhost:5001", "http://localhost:5002"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://localhost:27017/poinpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO middleware to make socket instance available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance-codes', attendanceCodeRoutes);

// Serve static assets from the client/build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Handle employee events from client
  socket.on('employee-created', (data) => {
    // Broadcast to all other clients
    socket.broadcast.emit('employee-created', data);
  });
  
  socket.on('employee-updated', (data) => {
    socket.broadcast.emit('employee-updated', data);
  });
  
  socket.on('employee-deleted', (data) => {
    socket.broadcast.emit('employee-deleted', data);
  });
  
  // Handle biometric events
  socket.on('biometric-status-updated', (data) => {
    socket.broadcast.emit('biometric-status-updated', data);
  });
  
  socket.on('biometric-validated', (data) => {
    socket.broadcast.emit('biometric-validated', data);
  });
});

// Function to find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve) => {
    const net = require('net');
    let port = startPort;
    
    const server = net.createServer();
    
    server.on('error', () => {
      // Port is in use, try the next one
      port++;
      server.listen(port);
    });
    
    server.on('listening', () => {
      // Found an available port
      server.close(() => {
        resolve(port);
      });
    });
    
    server.listen(port);
  });
};

// Start server
const PORT = process.env.PORT || 3002;

// Try to start the server with dynamic port allocation
(async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    server.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();

module.exports = { app, server, io }; 