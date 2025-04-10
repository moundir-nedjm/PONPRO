const express = require('express');
const router = express.Router();
const {
  getAttendanceCodes,
  getAttendanceCode,
  createAttendanceCode,
  updateAttendanceCode,
  deleteAttendanceCode
} = require('../controllers/attendanceCodeController');

// Get all attendance codes
router.get('/', getAttendanceCodes);

// Get single attendance code
router.get('/:id', getAttendanceCode);

// Create new attendance code
router.post('/', createAttendanceCode);

// Update attendance code
router.put('/:id', updateAttendanceCode);

// Delete attendance code
router.delete('/:id', deleteAttendanceCode);

module.exports = router; 