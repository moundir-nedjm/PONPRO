const AttendanceCode = require('../models/AttendanceCode');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all attendance codes
// @route   GET /api/attendance-codes
// @access  Private
exports.getAttendanceCodes = asyncHandler(async (req, res, next) => {
  try {
    const attendanceCodes = await AttendanceCode.find().sort({ code: 1 });
    
    if (!attendanceCodes || attendanceCodes.length === 0) {
      // Generate mock attendance codes if none exist and USE_MOCK_DATA is true
      if (process.env.USE_MOCK_DATA === 'true') {
        console.log('No attendance codes found and USE_MOCK_DATA is true, generating mock data');
        const mockCodes = generateMockAttendanceCodes();
        
        return res.status(200).json({
          success: true,
          count: mockCodes.length,
          data: mockCodes
        });
      } else {
        // If no mock data is allowed, just return an empty array
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
    }
    
    res.status(200).json({
      success: true,
      count: attendanceCodes.length,
      data: attendanceCodes
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single attendance code
// @route   GET /api/attendance-codes/:id
// @access  Private
exports.getAttendanceCode = asyncHandler(async (req, res, next) => {
  try {
    const attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return next(
        new ErrorResponse(`Code de présence non trouvé avec l'id ${req.params.id}`, 404)
      );
    }
    
    res.status(200).json({
      success: true,
      data: attendanceCode
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new attendance code
// @route   POST /api/attendance-codes
// @access  Private
exports.createAttendanceCode = asyncHandler(async (req, res, next) => {
  try {
    const attendanceCode = await AttendanceCode.create(req.body);
    
    res.status(201).json({
      success: true,
      data: attendanceCode
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update attendance code
// @route   PUT /api/attendance-codes/:id
// @access  Private
exports.updateAttendanceCode = asyncHandler(async (req, res, next) => {
  try {
    let attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return next(
        new ErrorResponse(`Code de présence non trouvé avec l'id ${req.params.id}`, 404)
      );
    }
    
    attendanceCode = await AttendanceCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: attendanceCode
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete attendance code
// @route   DELETE /api/attendance-codes/:id
// @access  Private
exports.deleteAttendanceCode = asyncHandler(async (req, res, next) => {
  try {
    const attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return next(
        new ErrorResponse(`Code de présence non trouvé avec l'id ${req.params.id}`, 404)
      );
    }
    
    await attendanceCode.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

// Helper function to generate mock attendance codes
function generateMockAttendanceCodes() {
  const mockCodes = [
    {
      _id: 'ac1',
      code: 'P',
      description: 'Présent',
      color: '#4CAF50',
      category: 'présence',
      isActive: true
    },
    {
      _id: 'ac2',
      code: 'A',
      description: 'Absent',
      color: '#F44336',
      category: 'absence',
      isActive: true
    },
    {
      _id: 'ac3',
      code: 'R',
      description: 'Retard',
      color: '#FFC107',
      category: 'présence',
      isActive: true
    },
    {
      _id: 'ac4',
      code: 'CP',
      description: 'Congé Payé',
      color: '#2196F3',
      category: 'congé',
      isActive: true
    },
    {
      _id: 'ac5',
      code: 'M',
      description: 'Maladie',
      color: '#9C27B0',
      category: 'absence',
      isActive: true
    },
    {
      _id: 'ac6',
      code: 'F',
      description: 'Formation',
      color: '#009688',
      category: 'autre',
      isActive: true
    },
    {
      _id: 'ac7',
      code: 'T',
      description: 'Télétravail',
      color: '#3F51B5',
      category: 'présence',
      isActive: true
    },
    {
      _id: 'ac8',
      code: 'CS',
      description: 'Congé Sans Solde',
      color: '#795548',
      category: 'congé',
      isActive: true
    },
    {
      _id: 'ac9',
      code: 'JF',
      description: 'Jour Férié',
      color: '#607D8B',
      category: 'congé',
      isActive: true
    },
    {
      _id: 'ac10',
      code: 'MS',
      description: 'Mission',
      color: '#FF9800',
      category: 'présence',
      isActive: true
    }
  ];
  
  return mockCodes;
} 