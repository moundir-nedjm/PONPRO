const express = require('express');
const { exportMonthlyAttendance } = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Export monthly attendance to Excel
router.get('/export/:id', exportMonthlyAttendance);

module.exports = router; 