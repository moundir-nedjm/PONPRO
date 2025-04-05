const express = require('express');
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/schedules');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getSchedules)
  .post(protect, authorize('admin', 'manager'), createSchedule);

router
  .route('/:id')
  .get(protect, getSchedule)
  .put(protect, authorize('admin', 'manager'), updateSchedule)
  .delete(protect, authorize('admin', 'manager'), deleteSchedule);

module.exports = router; 