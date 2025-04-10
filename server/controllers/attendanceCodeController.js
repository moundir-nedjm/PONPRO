const AttendanceCode = require('../models/AttendanceCode');

// @desc    Get all attendance codes
// @route   GET /api/attendance-codes
// @access  Public
exports.getAttendanceCodes = async (req, res) => {
  try {
    console.log('Getting attendance codes');
    const codes = await AttendanceCode.find().sort('code');
    
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
exports.getAttendanceCode = async (req, res) => {
  try {
    const attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return res.status(404).json({
        success: false,
        message: `Code de présence non trouvé avec l'id ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendanceCode
    });
  } catch (err) {
    console.error('Error fetching attendance code:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
};

// @desc    Create new attendance code
// @route   POST /api/attendance-codes
// @access  Private
exports.createAttendanceCode = async (req, res) => {
  try {
    const attendanceCode = await AttendanceCode.create(req.body);
    
    res.status(201).json({
      success: true,
      data: attendanceCode
    });
  } catch (err) {
    console.error('Error creating attendance code:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ce code existe déjà'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
};

// @desc    Update attendance code
// @route   PUT /api/attendance-codes/:id
// @access  Private
exports.updateAttendanceCode = async (req, res) => {
  try {
    let attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return res.status(404).json({
        success: false,
        message: `Code de présence non trouvé avec l'id ${req.params.id}`
      });
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
    console.error('Error updating attendance code:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
};

// @desc    Delete attendance code
// @route   DELETE /api/attendance-codes/:id
// @access  Private
exports.deleteAttendanceCode = async (req, res) => {
  try {
    const attendanceCode = await AttendanceCode.findById(req.params.id);
    
    if (!attendanceCode) {
      return res.status(404).json({
        success: false,
        message: `Code de présence non trouvé avec l'id ${req.params.id}`
      });
    }
    
    await attendanceCode.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting attendance code:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
}; 