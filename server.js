const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const seedDatabase = require('./server/seedData');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI = 'mongodb+srv://testuser:testpassword123@cluster0.mongodb.net/poinpro-test?retryWrites=true&w=majority';
mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected');
  // Run seed function to ensure we have test data
  seedDatabase().then(() => {
    console.log('Database seeding complete');
  });
})
.catch(err => console.error('MongoDB Connection Error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5003;

// Socket.io middleware to pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to POINTGEE API' });
});

// Import routes
const employeeRoutes = require('./server/routes/employee.routes');
const departmentRoutes = require('./server/routes/department.routes');
const attendanceRoutes = require('./server/routes/attendance.routes');
const attendanceCodeRoutes = require('./server/routes/attendance-code.routes');

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance-codes', attendanceCodeRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 