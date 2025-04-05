const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployeeAccount,
  getEmployeeDashboard,
  getEmployeeStats,
  getEmployeeBiometrics,
  saveEmployeeBiometrics,
  getEmployeeBarcode
} = require('../controllers/employeeController');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const scheduleRouter = require('./schedules');

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.route('/')
  .get(getEmployees)
  .post(authorize('admin', 'manager'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin', 'manager'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

// Create user account for employee
router.post('/:id/account', authorize('admin'), createEmployeeAccount);

// Get employee dashboard data
router.get('/:id/dashboard', getEmployeeDashboard);

// Get employee stats
router.get('/:id/stats', getEmployeeStats);

// Employee biometrics routes
router.route('/:id/biometrics')
  .get(getEmployeeBiometrics)
  .post(saveEmployeeBiometrics);

// Employee barcode route
router.get('/:id/barcode', getEmployeeBarcode);

// Re-route into other resource routers
router.use('/:employeeId/schedules', scheduleRouter);

module.exports = router; 