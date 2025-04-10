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

// Register face for an employee
router.post('/register-face', async (req, res) => {
  try {
    const { employeeId, faceData } = req.body;
    
    if (!employeeId || !faceData) {
      return res.status(400).json({ 
        success: false, 
        message: 'EmployeeId and faceData are required' 
      });
    }
    
    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // Create biometric data record for face recognition
    const biometricData = new BiometricData({
      employeeId,
      type: 'faceRecognition',
      quality: 100, // Default quality
      data: faceData,
      pose: 'front' // Default pose
    });
    
    await biometricData.save();
    
    // Update employee biometric status
    if (!employee.biometricStatus) {
      employee.biometricStatus = {};
    }
    
    if (!employee.biometricStatus.faceRecognition) {
      employee.biometricStatus.faceRecognition = {
        status: 'in_progress',
        samplesCount: 0
      };
    }
    
    // Increment sample count
    const currentCount = employee.biometricStatus.faceRecognition.samplesCount || 0;
    const newCount = currentCount + 1;
    
    // Update status based on sample count
    const newStatus = newCount >= 3 ? 'completed' : 'in_progress';
    
    employee.biometricStatus.faceRecognition.status = newStatus;
    employee.biometricStatus.faceRecognition.samplesCount = newCount;
    
    if (newStatus === 'completed') {
      employee.biometricStatus.faceRecognition.enrollmentDate = new Date();
    }
    
    await employee.save();
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('biometric-face-registered', {
        employeeId,
        status: newStatus,
        samplesCount: newCount
      });
    }
    
    res.status(201).json({ 
      success: true, 
      data: { 
        status: newStatus, 
        samplesCount: newCount 
      } 
    });
  } catch (err) {
    console.error('Error registering face:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during face registration' 
    });
  }
});

// Recognize a face
router.post('/recognize-face', async (req, res) => {
  try {
    const { faceData } = req.body;
    
    if (!faceData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Face data is required' 
      });
    }
    
    // Get all face recognition samples from database
    const allFaceSamples = await BiometricData.find({ 
      type: 'faceRecognition'
    }).populate('employeeId', 'firstName lastName employeeId active');
    
    if (allFaceSamples.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered faces found in the system'
      });
    }
    
    // Filter out inactive employees
    const activeFaceSamples = allFaceSamples.filter(sample => 
      sample.employeeId && sample.employeeId.active === true
    );
    
    if (activeFaceSamples.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active employees with registered faces found'
      });
    }
    
    // Function to calculate Euclidean distance between face descriptors
    const calculateDistance = (descriptor1, descriptor2) => {
      if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return Number.MAX_VALUE;
      }
      
      return Math.sqrt(
        descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
      );
    };
    
    // Find the best match
    let bestMatch = null;
    let bestDistance = Number.MAX_VALUE;
    const DISTANCE_THRESHOLD = 0.6; // Adjust this threshold based on testing
    
    for (const sample of activeFaceSamples) {
      const distance = calculateDistance(faceData, sample.data);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = sample;
      }
    }
    
    // Check if the best match is within the acceptable threshold
    if (bestMatch && bestDistance <= DISTANCE_THRESHOLD) {
      // Get more complete employee details
      const employee = await Employee.findById(bestMatch.employeeId._id);
      
      return res.status(200).json({
        success: true,
        match: true,
        distance: bestDistance,
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          department: employee.department,
          position: employee.position
        }
      });
    }
    
    // No match found within threshold
    return res.status(200).json({
      success: true,
      match: false,
      message: 'No matching face found'
    });
    
  } catch (err) {
    console.error('Error recognizing face:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during face recognition' 
    });
  }
});

module.exports = router; 