const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const moment = require('moment');

// @desc    Get all performance evaluations
// @route   GET /api/performance
// @access  Private/Admin/Manager
exports.getPerformanceEvaluations = async (req, res, next) => {
  try {
    // Add query parameters for filtering
    const { employeeId, status, period, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (employeeId) {
      filter.employee = employeeId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (period) {
      filter['period.label'] = period;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find evaluations with pagination
    const evaluations = await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('evaluator', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Performance.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: evaluations.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: evaluations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single performance evaluation
// @route   GET /api/performance/:id
// @access  Private
exports.getPerformanceEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Performance.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId position department')
      .populate('evaluator', 'name');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Check if user has access to this evaluation
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isOwner = req.user.id === evaluation.employee._id.toString();
    const isEvaluator = req.user.id === evaluation.evaluator._id.toString();

    if (!isAdmin && !isManager && !isOwner && !isEvaluator) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette évaluation'
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new performance evaluation
// @route   POST /api/performance
// @access  Private/Admin/Manager
exports.createPerformanceEvaluation = async (req, res, next) => {
  try {
    // Set evaluator to current user
    req.body.evaluator = req.user.id;
    
    // Create evaluation
    const evaluation = await Performance.create(req.body);
    
    // Get attendance metrics for the period
    if (req.body.employee && req.body.period) {
      const { startDate, endDate } = req.body.period;
      await updateAttendanceMetrics(evaluation._id, req.body.employee, startDate, endDate);
    }
    
    res.status(201).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a performance evaluation
// @route   PUT /api/performance/:id
// @access  Private/Admin/Manager
exports.updatePerformanceEvaluation = async (req, res, next) => {
  try {
    let evaluation = await Performance.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Check if user is authorized to update
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isEvaluator = req.user.id === evaluation.evaluator.toString();

    if (!isAdmin && !isManager && !isEvaluator) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour modifier cette évaluation'
      });
    }

    // Update evaluation
    evaluation = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('employee', 'firstName lastName employeeId');

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a performance evaluation
// @route   DELETE /api/performance/:id
// @access  Private/Admin
exports.deletePerformanceEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Performance.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour supprimer cette évaluation'
      });
    }

    await evaluation.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee acknowledges evaluation
// @route   PUT /api/performance/:id/acknowledge
// @access  Private
exports.acknowledgeEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Performance.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Check if user is the evaluated employee
    if (req.user.id !== evaluation.employee.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas confirmer cette évaluation'
      });
    }

    // Update acknowledgement fields
    evaluation.acknowledgement = {
      employeeAcknowledged: true,
      employeeAcknowledgedAt: Date.now(),
      employeeComments: req.body.comments || ''
    };
    
    // Update status
    evaluation.status = 'acknowledged';

    await evaluation.save();

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Finalize evaluation
// @route   PUT /api/performance/:id/finalize
// @access  Private/Admin/Manager
exports.finalizeEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Performance.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Check if user is authorized
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isEvaluator = req.user.id === evaluation.evaluator.toString();

    if (!isAdmin && !isManager && !isEvaluator) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé pour finaliser cette évaluation'
      });
    }

    // Update status
    evaluation.status = 'finalized';

    await evaluation.save();

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to update attendance metrics
async function updateAttendanceMetrics(evaluationId, employeeId, startDate, endDate) {
  try {
    // Convert dates to moment objects
    const start = moment(startDate);
    const end = moment(endDate);
    
    // Calculate total days in period
    const totalDays = end.diff(start, 'days') + 1;
    
    // Query attendance for the period
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    });
    
    // Query leaves for the period
    const leaveRecords = await Leave.find({
      employee: employeeId,
      startDate: { $lte: end.toDate() },
      endDate: { $gte: start.toDate() },
      status: 'approved'
    });
    
    // Calculate metrics
    let presentDays = 0;
    let lateDays = 0;
    
    // Count attendance
    attendanceRecords.forEach(record => {
      if (record.status === 'present') {
        presentDays++;
        
        // Check if late
        if (record.timeIn && record.expectedTimeIn) {
          const timeIn = moment(record.timeIn);
          const expectedTimeIn = moment(record.expectedTimeIn);
          
          if (timeIn.isAfter(expectedTimeIn)) {
            lateDays++;
          }
        }
      }
    });
    
    // Count leave days
    let leaveDays = 0;
    leaveRecords.forEach(leave => {
      const leaveStart = moment.max(start, moment(leave.startDate));
      const leaveEnd = moment.min(end, moment(leave.endDate));
      const days = leaveEnd.diff(leaveStart, 'days') + 1;
      leaveDays += days;
    });
    
    // Calculate absent days
    const absentDays = totalDays - presentDays - leaveDays;
    
    // Calculate attendance score (present days + leave days / total days)
    const attendanceScore = ((presentDays + leaveDays) / totalDays) * 100;
    
    // Update the performance evaluation
    await Performance.findByIdAndUpdate(evaluationId, {
      attendanceMetrics: {
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendanceScore: attendanceScore.toFixed(2)
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating attendance metrics:', error);
    return false;
  }
} 