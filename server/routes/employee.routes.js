const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
  try {
    // Filter by department if provided in query
    const filter = {};
    
    // Handle case where multiple department parameters are provided
    // This handles both single department queries (?department=X) and
    // multiple department queries (?department=X&department=Y)
    if (req.query.department) {
      // If multiple departments are specified, req.query.department will be an array
      if (Array.isArray(req.query.department)) {
        filter.department = { $in: req.query.department };
      } else {
        filter.department = req.query.department;
      }
      console.log('Filtering employees by departments:', filter.department);
    }
    
    console.log('Employee filter query:', filter);
    const employees = await Employee.find(filter).populate('department');
    console.log(`Found ${employees.length} employees matching filter`);
    
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('GET employee with ID:', id);
    
    // Check if the ID is a valid MongoDB ObjectID
    const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    let employee;
    
    if (isValidObjectId) {
      // Try to find by MongoDB _id
      employee = await Employee.findById(id).populate('department');
    }
    
    // If not found by _id, try by custom employeeId field
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id }).populate('department');
    }
    
    if (!employee) {
      console.log('Employee not found with ID:', id);
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    console.log('Found employee:', employee._id);
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all active employees
router.get('/active/list', async (req, res) => {
  try {
    const activeEmployees = await Employee.find({ active: true }).populate('department');
    res.status(200).json({ 
      success: true, 
      count: activeEmployees.length,
      data: activeEmployees
    });
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance for employee
router.get('/:id/attendance', async (req, res) => {
  try {
    // Find the employee first to make sure they exist
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Return empty data for now as placeholder
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (err) {
    console.error('Error fetching employee attendance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    console.log('Creating new employee with data:', JSON.stringify(req.body));
    
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'employeeId', 'position', 'department'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const employee = new Employee(req.body);
    
    // Try to save with more detailed error handling
    try {
      await employee.save();
      
      // Emit real-time update
      req.io.emit('employee-created', employee);
      
      res.status(201).json({ success: true, data: employee });
    } catch (saveErr) {
      console.error('Error saving employee:', saveErr);
      
      // Handle duplicate key errors
      if (saveErr.code === 11000) {
        const field = Object.keys(saveErr.keyPattern)[0];
        return res.status(400).json({ 
          success: false, 
          message: `Duplicate value for ${field}. This value is already in use.`,
          field: field
        });
      }
      
      // Handle validation errors
      if (saveErr.name === 'ValidationError') {
        const errors = Object.keys(saveErr.errors).reduce((acc, key) => {
          acc[key] = saveErr.errors[key].message;
          return acc;
        }, {});
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors
        });
      }
      
      throw saveErr; // Re-throw for the outer catch block
    }
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + (err.message || 'Unknown error') 
    });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('UPDATE employee with ID:', id);
    
    // Check if the ID is a valid MongoDB ObjectID
    const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    let employee;
    
    if (isValidObjectId) {
      // Try to find and update by MongoDB _id
      employee = await Employee.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    // If not found by _id, try by custom employeeId field
    if (!employee) {
      employee = await Employee.findOneAndUpdate(
        { employeeId: id },
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    if (!employee) {
      console.log('Employee not found for update with ID:', id);
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    console.log('Updated employee:', employee._id);
    
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
    const { id } = req.params;
    
    console.log('DELETE employee with ID:', id);
    
    // Check if the ID is a valid MongoDB ObjectID
    const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    let employee;
    
    if (isValidObjectId) {
      // Try to find and delete by MongoDB _id
      employee = await Employee.findByIdAndDelete(id);
    }
    
    // If not found by _id, try by custom employeeId field
    if (!employee) {
      employee = await Employee.findOneAndDelete({ employeeId: id });
    }
    
    if (!employee) {
      console.log('Employee not found for deletion with ID:', id);
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    console.log('Deleted employee:', employee._id);
    
    // Emit real-time update
    req.io.emit('employee-deleted', employee._id.toString());
    
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