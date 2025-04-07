const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/poinpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Import routes
const authRoutes = require('./src/routes/auth');
const attendanceRoutes = require('./src/routes/attendance');
const employeesRoutes = require('./src/routes/employees');
const departmentsRoutes = require('./src/routes/departments');
const leavesRoutes = require('./src/routes/leaves');
const reportsRoutes = require('./src/routes/reports');
const notificationsRoutes = require('./src/routes/notifications');
const performanceRoutes = require('./src/routes/performance');
const attendanceCodesRoutes = require('./src/routes/attendanceCodeRoutes');
const documentsRoutes = require('./src/routes/documents');
const schedulesRoutes = require('./src/routes/schedules');

const app = express();
const PORT = process.env.PORT || 50021;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to POINTGEE API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/attendance-codes', attendanceCodesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/schedules', schedulesRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 