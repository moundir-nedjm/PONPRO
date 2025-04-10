const AttendanceCode = require('../models/AttendanceCode');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all attendance codes
// @route   GET /api/attendance-codes
// @access  Public
exports.getAttendanceCodes = async (req, res) => {
  try {
    console.log('Getting attendance codes');
    const codes = await AttendanceCode.find({ isActive: true }).sort('code');
    
    console.log(`Found ${codes.length} attendance codes`);
    
    res.status(200).json({
      success: true,
      count: codes.length,
      data: codes
    });
  } catch (err) {
    console.error('Error fetching attendance codes:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
};

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