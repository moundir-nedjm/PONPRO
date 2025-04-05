const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Leave.find(JSON.parse(queryStr)).populate({
      path: 'employee',
      select: 'firstName lastName employeeId department',
      populate: {
        path: 'department',
        select: 'name'
      }
    }).populate({
      path: 'approvedBy',
      select: 'name'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Leave.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const leaves = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: leaves.length,
      pagination,
      data: leaves
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single leave request
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate({
      path: 'employee',
      select: 'firstName lastName employeeId department',
      populate: {
        path: 'department',
        select: 'name'
      }
    }).populate({
      path: 'approvedBy',
      select: 'name'
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: `Leave request not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res, next) => {
  try {
    // Check if employee exists
    const employee = await Employee.findById(req.body.employee);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.body.employee}`
      });
    }

    // Create leave request
    const leave = await Leave.create(req.body);

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private
exports.updateLeave = async (req, res, next) => {
  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: `Leave request not found with id of ${req.params.id}`
      });
    }

    // Make sure user is admin or manager or the employee who created the request
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'manager' && 
      leave.employee.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this leave request`
      });
    }

    // If the leave request is already approved or rejected, only admin can update it
    if (
      leave.status !== 'pending' && 
      req.user.role !== 'admin'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update leave request that has already been processed'
      });
    }

    leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
exports.deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: `Leave request not found with id of ${req.params.id}`
      });
    }

    // Make sure user is admin or the employee who created the request
    if (
      req.user.role !== 'admin' && 
      leave.employee.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this leave request`
      });
    }

    // If the leave request is already approved or rejected, only admin can delete it
    if (
      leave.status !== 'pending' && 
      req.user.role !== 'admin'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete leave request that has already been processed'
      });
    }

    await leave.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin/Manager
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (approved or rejected)'
      });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: `Leave request not found with id of ${req.params.id}`
      });
    }

    // Make sure user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update leave status`
      });
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvalDate = Date.now();
    
    if (comments) {
      leave.comments = comments;
    }

    await leave.save();

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave requests for a specific employee
// @route   GET /api/employees/:employeeId/leaves
// @access  Private
exports.getEmployeeLeaves = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${employeeId}`
      });
    }

    // Find leave requests for the employee
    const leaves = await Leave.find({ employee: employeeId }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (err) {
    next(err);
  }
}; 