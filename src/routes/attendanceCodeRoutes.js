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

// Public route for getting all codes
router.get('/', getAttendanceCodes);

// Protected routes
router
  .route('/')
  .post(protect, authorize('admin', 'manager'), createAttendanceCode);

router
  .route('/:id')
  .get(getAttendanceCode)
  .put(protect, authorize('admin', 'manager'), updateAttendanceCode)
  .delete(protect, authorize('admin'), deleteAttendanceCode);

module.exports = router; 