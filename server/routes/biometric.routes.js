const express = require('express');
const router = express.Router();
const BiometricData = require('../models/BiometricData');
const Employee = require('../models/Employee');

// Save biometric scan data
router.post('/scan', async (req, res) => {
  try {
    const { employeeId, type, quality, data } = req.body;
    
    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Create biometric data record
    const biometricData = new BiometricData({
      employeeId,
      type,
      quality,
      data
    });
    
    // If this is a multi-pose face scan
    if (type === 'faceRecognition' && typeof data === 'object' && Object.keys(data).length > 0) {
      // Handle different poses
      for (const [pose, imageData] of Object.entries(data)) {
        await new BiometricData({
          employeeId,
          type,
          quality,
          data: imageData,
          pose
        }).save();
      }
    } else {
      await biometricData.save();
    }
    
    // Update employee biometric status
    const currentStatus = employee.biometricStatus?.[type]?.status || 'not_started';
    const currentCount = employee.biometricStatus?.[type]?.samplesCount || 0;
    
    // Determine samples increment
    const samplesIncrement = type === 'faceRecognition' && typeof data === 'object' ? 
      Object.keys(data).length : 1;
    
    const newCount = currentCount + samplesIncrement;
    
    // Determine new status
    let newStatus = currentStatus;
    if (currentStatus === 'not_started' || currentStatus === 'in_progress') {
      const requiredSamples = type === 'faceRecognition' ? 3 : 3; // Adjust based on your requirements
      newStatus = newCount >= requiredSamples ? 'completed' : 'in_progress';
    }
    
    // Update employee biometric status
    if (!employee.biometricStatus) {
      employee.biometricStatus = {};
    }
    
    if (!employee.biometricStatus[type]) {
      employee.biometricStatus[type] = {};
    }
    
    employee.biometricStatus[type].status = newStatus;
    employee.biometricStatus[type].samplesCount = newCount;
    
    if (newStatus === 'completed') {
      employee.biometricStatus[type].enrollmentDate = new Date();
    }
    
    await employee.save();
    
    // Emit real-time update
    req.io.emit('biometric-scan-completed', {
      employeeId,
      type,
      status: newStatus,
      samplesCount: newCount
    });
    
    res.status(201).json({ 
      success: true, 
      data: { 
        status: newStatus, 
        samplesCount: newCount 
      } 
    });
  } catch (err) {
    console.error('Error saving biometric scan:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get biometric samples for an employee
router.get('/samples/:employeeId/:type', async (req, res) => {
  try {
    const { employeeId, type } = req.params;
    
    const samples = await BiometricData.find({ employeeId, type });
    
    res.status(200).json({ success: true, data: samples });
  } catch (err) {
    console.error('Error fetching biometric samples:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 