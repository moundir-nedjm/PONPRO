const express = require('express');
const {
  getAttendanceReport,
  getLeaveReport,
  getPerformanceReport
} = require('../controllers/reportController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Only use basic authentication protection without role restrictions for demo
router.use(protect);
// Removed role authorization to allow any user to access reports

// Report routes
router.get('/attendance', getAttendanceReport);
router.get('/leaves', getLeaveReport);
router.get('/performance', getPerformanceReport);

module.exports = router; 