const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    
    // Add employee count to each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ department: dept._id });
        const deptObj = dept.toObject();
        deptObj.employeeCount = employeeCount;
        return deptObj;
      })
    );
    
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departmentsWithCounts
    });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments'
    });
  }
});

// Get a single department by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }
    
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id ${id}`
      });
    }
    
    // Get the count of employees in this department
    const employeeCount = await Employee.countDocuments({ department: id });
    
    // Get employee details if requested
    let employees = [];
    if (req.query.includeEmployees === 'true') {
      employees = await Employee.find({ department: id });
    }
    
    // Convert to plain object so we can add properties
    const departmentData = department.toObject();
    departmentData.employeeCount = employeeCount;
    
    if (employees.length > 0) {
      departmentData.employees = employees;
    }
    
    res.status(200).json({
      success: true,
      data: departmentData
    });
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department details'
    });
  }
});

// Create a new department
router.post('/', async (req, res) => {
  try {
    const department = await Department.create(req.body);
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (err) {
    console.error('Error creating department:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create department'
    });
  }
});

// Update a department
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }
    
    const department = await Department.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    console.error('Error updating department:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update department'
    });
  }
});

// Delete a department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }
    
    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: id });
    
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${employeeCount} employees. Please reassign employees first.`
      });
    }
    
    const department = await Department.findByIdAndDelete(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department'
    });
  }
});

module.exports = router; 