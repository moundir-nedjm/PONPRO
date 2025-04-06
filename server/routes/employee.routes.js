const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    
    // Emit real-time update
    req.io.emit('employee-created', employee);
    
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Emit real-time update
    req.io.emit('employee-updated', employee);
    
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Emit real-time update
    req.io.emit('employee-deleted', req.params.id);
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update employee biometric status
router.put('/:id/biometric-status', async (req, res) => {
  try {
    const { biometricType, status, samplesCount } = req.body;
    
    // Find the employee
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Update biometric status
    if (!employee.biometricStatus) {
      employee.biometricStatus = {};
    }
    
    if (!employee.biometricStatus[biometricType]) {
      employee.biometricStatus[biometricType] = {};
    }
    
    employee.biometricStatus[biometricType].status = status;
    
    if (typeof samplesCount !== 'undefined') {
      employee.biometricStatus[biometricType].samplesCount = samplesCount;
    }
    
    if (status === 'completed') {
      employee.biometricStatus[biometricType].enrollmentDate = new Date();
    }
    
    await employee.save();
    
    // Emit real-time update
    req.io.emit('employee-biometric-updated', {
      employeeId: employee._id,
      biometricType,
      status,
      samplesCount
    });
    
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error updating biometric status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Validate biometric enrollment
router.put('/:id/validate-biometric', async (req, res) => {
  try {
    const { biometricType, decision, notes } = req.body;
    
    // Find the employee
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Update validation status
    if (!employee.biometricStatus || !employee.biometricStatus[biometricType]) {
      return res.status(400).json({
        success: false,
        message: `No ${biometricType} data found for this employee`
      });
    }
    
    employee.biometricStatus[biometricType].status = decision;
    employee.biometricStatus[biometricType].validationDate = new Date();
    
    if (notes) {
      employee.biometricStatus[biometricType].validationNotes = notes;
    }
    
    await employee.save();
    
    // Emit real-time update
    req.io.emit('employee-biometric-validated', {
      employeeId: employee._id,
      biometricType,
      status: decision
    });
    
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error validating biometric enrollment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 