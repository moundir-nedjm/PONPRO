const Schedule = require('../models/Schedule');
const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = asyncHandler(async (req, res, next) => {
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
  query = Schedule.find(JSON.parse(queryStr)).populate({
    path: 'employee',
    select: 'name employeeId department'
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
  const total = await Schedule.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const schedules = await query;

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
    count: schedules.length,
    pagination,
    data: schedules
  });
});

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
exports.getSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id).populate({
    path: 'employee',
    select: 'name employeeId department'
  });

  if (!schedule) {
    return next(
      new ErrorResponse(`Schedule not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: schedule
  });
});

// @desc    Get schedules for an employee
// @route   GET /api/employees/:employeeId/schedules
// @access  Private
exports.getEmployeeSchedules = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.employeeId);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.employeeId}`, 404)
    );
  }

  const schedules = await Schedule.find({ employee: req.params.employeeId })
    .sort('weekday');

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private
exports.createSchedule = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check if employee exists
  const employee = await Employee.findById(req.body.employee);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.body.employee}`, 404)
    );
  }

  const schedule = await Schedule.create(req.body);

  res.status(201).json({
    success: true,
    data: schedule
  });
});

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = asyncHandler(async (req, res, next) => {
  let schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(
      new ErrorResponse(`Schedule not found with id of ${req.params.id}`, 404)
    );
  }

  schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: schedule
  });
});

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(
      new ErrorResponse(`Schedule not found with id of ${req.params.id}`, 404)
    );
  }

  await schedule.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create bulk schedules for an employee
// @route   POST /api/employees/:employeeId/schedules/bulk
// @access  Private
exports.createBulkSchedules = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.employeeId);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.employeeId}`, 404)
    );
  }

  // Validate that schedules array is provided
  if (!req.body.schedules || !Array.isArray(req.body.schedules)) {
    return next(
      new ErrorResponse('Please provide an array of schedules', 400)
    );
  }

  // Add employee and user to each schedule
  const schedulesToCreate = req.body.schedules.map(schedule => ({
    ...schedule,
    employee: req.params.employeeId,
    createdBy: req.user.id
  }));

  // Create all schedules
  const schedules = await Schedule.insertMany(schedulesToCreate);

  res.status(201).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
}); 