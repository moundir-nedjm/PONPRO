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

router
  .route('/')
  .get(protect, getAttendanceCodes)
  .post(protect, authorize('admin'), createAttendanceCode);

router
  .route('/:id')
  .get(protect, getAttendanceCode)
  .put(protect, authorize('admin'), updateAttendanceCode)
  .delete(protect, authorize('admin'), deleteAttendanceCode);

module.exports = router; 