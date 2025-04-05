const express = require('express');
const {
  getAttendanceCodes,
  getAttendanceCode,
  createAttendanceCode,
  updateAttendanceCode,
  deleteAttendanceCode
} = require('../controllers/attendanceCodeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(getAttendanceCodes)
  .post(authorize('admin', 'manager'), createAttendanceCode);

router
  .route('/:id')
  .get(getAttendanceCode)
  .put(authorize('admin', 'manager'), updateAttendanceCode)
  .delete(authorize('admin'), deleteAttendanceCode);

module.exports = router; 