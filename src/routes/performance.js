const express = require('express');
const {
  getPerformanceEvaluations,
  getPerformanceEvaluation,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
  acknowledgeEvaluation,
  finalizeEvaluation
} = require('../controllers/performanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(authorize('admin', 'manager'), getPerformanceEvaluations)
  .post(authorize('admin', 'manager'), createPerformanceEvaluation);

router
  .route('/:id')
  .get(getPerformanceEvaluation)
  .put(authorize('admin', 'manager'), updatePerformanceEvaluation)
  .delete(authorize('admin'), deletePerformanceEvaluation);

router
  .route('/:id/acknowledge')
  .put(acknowledgeEvaluation);

router
  .route('/:id/finalize')
  .put(authorize('admin', 'manager'), finalizeEvaluation);

module.exports = router; 