const express = require('express');
const {
  getNotifications,
  getNotification,
  createNotification,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  retryNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(getNotifications)
  .post(authorize('admin', 'manager'), createNotification);

router
  .route('/bulk')
  .post(authorize('admin', 'manager'), createBulkNotifications);

router
  .route('/read-all')
  .put(markAllAsRead);

router
  .route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

router
  .route('/:id/read')
  .put(markAsRead);

router
  .route('/:id/retry')
  .put(authorize('admin'), retryNotification);

module.exports = router; 