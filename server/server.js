const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employee.routes');
const biometricRoutes = require('./routes/biometric.routes');
const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');

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

// Pass Socket.IO instance to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 