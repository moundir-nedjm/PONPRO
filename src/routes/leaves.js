const express = require('express');
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  deleteLeave,
  updateLeaveStatus
} = require('../controllers/leaveController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Leave routes
router.route('/')
  .get(getLeaves)
  .post(createLeave);

router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(deleteLeave);

// Update leave status (approve/reject)
router.put('/:id/status', authorize('admin', 'manager'), updateLeaveStatus);

module.exports = router; 