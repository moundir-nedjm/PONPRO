const express = require('express');
const { protect } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// Get all employees or create a new employee
router
  .route('/')
  .get(protect, employeeController.getEmployees)
  .post(protect, employeeController.createEmployee);

// Get, update, or delete a specific employee by ID
router
  .route('/:id')
  .get(protect, employeeController.getEmployee)
  .put(protect, employeeController.updateEmployee)
  .delete(protect, employeeController.deleteEmployee);

// Biometric status routes
router
  .route('/:id/biometric-status')
  .get(protect, employeeController.getBiometricStatus)
  .put(protect, employeeController.updateBiometricStatus);

// Biometric validation route (team leaders and admins only)
router.put(
  '/:id/validate-biometric',
  protect,
  employeeController.validateBiometricEnrollment
);

// Employee biometrics routes
router
  .route('/:id/biometrics')
  .get(protect, employeeController.getEmployeeBiometrics)
  .post(protect, employeeController.saveEmployeeBiometrics);

// Employee barcode route
router.get('/:id/barcode', protect, employeeController.getEmployeeBarcode);

module.exports = router; 