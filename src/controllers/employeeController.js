const Employee = require('../models/Employee');
const User = require('../models/User');
const Biometric = require('../models/Biometric');
const biometricsConfig = require('../config/biometrics.config');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res, next) => {
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
    query = Employee.find(JSON.parse(queryStr)).populate('department');

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
    const total = await Employee.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const employees = await query;

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
      count: employees.length,
      pagination,
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`
      });
    }

    // Make sure user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this employee`
      });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`
      });
    }

    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this employee`
      });
    }

    await employee.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user account for employee
// @route   POST /api/employees/:id/account
// @access  Private/Admin
exports.createEmployeeAccount = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`
      });
    }

    // Check if employee already has an account
    if (employee.user) {
      return res.status(400).json({
        success: false,
        message: 'Employee already has a user account'
      });
    }

    const { password, role } = req.body;

    // Create user
    const user = await User.create({
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      password,
      role: role || 'user',
      department: employee.department
    });

    // Update employee with user reference
    employee.user = user._id;
    await employee.save();

    res.status(201).json({
      success: true,
      data: {
        employee,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee attendance dashboard
// @route   GET /api/employees/:id/dashboard
// @access  Private
exports.getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    
    // Mock data for testing
    const dashboardData = {
      attendanceStats: {
        present: 18,
        absent: 2,
        late: 3,
        onTime: 15
      },
      todayStatus: 'En attente',
      recentAttendance: [
        {
          id: 1,
          date: new Date(),
          status: 'present',
          checkIn: '08:30',
          checkOut: '17:00'
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000),
          status: 'present',
          checkIn: '08:25',
          checkOut: '17:10'
        },
        {
          id: 3,
          date: new Date(Date.now() - 172800000),
          status: 'late',
          checkIn: '09:15',
          checkOut: '17:30'
        }
      ],
      upcomingLeaves: [
        {
          id: 1,
          type: 'Congé annuel',
          startDate: new Date(Date.now() + 604800000),
          endDate: new Date(Date.now() + 1209600000),
          status: 'approved'
        }
      ]
    };

    res.status(200).json(dashboardData);
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee stats
// @route   GET /api/employees/:id/stats
// @access  Private
exports.getEmployeeStats = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const { timeRange = 'month' } = req.query;
    
    // Mock data for testing
    const statsData = {
      attendanceByMonth: [
        { month: 'Jan', present: 20, absent: 2, late: 3 },
        { month: 'Feb', present: 18, absent: 2, late: 4 },
        { month: 'Mar', present: 21, absent: 1, late: 2 },
        { month: 'Apr', present: 19, absent: 3, late: 2 },
        { month: 'May', present: 20, absent: 2, late: 3 },
        { month: 'Jun', present: 18, absent: 4, late: 2 }
      ],
      attendanceByDay: [
        { day: 'Lun', present: 4, absent: 0, late: 1 },
        { day: 'Mar', present: 5, absent: 0, late: 0 },
        { day: 'Mer', present: 4, absent: 1, late: 0 },
        { day: 'Jeu', present: 5, absent: 0, late: 0 },
        { day: 'Ven', present: 5, absent: 0, late: 0 }
      ],
      attendanceDistribution: [
        { name: 'Présent', value: 85 },
        { name: 'Absent', value: 10 },
        { name: 'En retard', value: 5 }
      ],
      workHoursStats: [
        { day: 'Lun', hours: 8.5 },
        { day: 'Mar', hours: 8.2 },
        { day: 'Mer', hours: 7.5 },
        { day: 'Jeu', hours: 8.0 },
        { day: 'Ven', hours: 7.8 }
      ],
      lateStats: [
        { month: 'Jan', value: 2 },
        { month: 'Feb', value: 3 },
        { month: 'Mar', value: 1 },
        { month: 'Apr', value: 2 },
        { month: 'May', value: 4 },
        { month: 'Jun', value: 2 }
      ],
      overallStats: {
        totalDays: 120,
        presentDays: 102,
        absentDays: 8,
        lateDays: 10,
        averageWorkHours: 7.9
      }
    };

    res.status(200).json(statsData);
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee biometrics
// @route   GET /api/employees/:id/biometrics
// @access  Private
exports.getEmployeeBiometrics = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const isAdmin = req.user.role === 'admin';
    
    // Get employee's biometric data
    const biometricData = await Biometric.findOne({ employeeId });
    
    if (!biometricData) {
      return res.status(404).json({
        success: false,
        message: 'Données biométriques non trouvées'
      });
    }

    // If requesting admin's biometrics, check if all required biometrics are set up
    if (isAdmin) {
      const adminRequirements = biometricsConfig.adminRequirements;
      const requirementsMet = {
        faceRecognition: biometricData.faceSamples?.length >= adminRequirements.faceRecognition.minSamples,
        fingerprint: biometricData.fingerprintSamples?.length >= adminRequirements.fingerprint.minSamples,
        qrCode: biometricData.qrCode && new Date(biometricData.qrCode.lastUpdated) > new Date(Date.now() - adminRequirements.qrCode.refreshInterval)
      };

      return res.status(200).json({
        success: true,
        data: {
          ...biometricData.toObject(),
          requirementsMet,
          isAdmin
        }
      });
    }

    // For regular employees, return only necessary data
    res.status(200).json({
      success: true,
      data: {
        hasFaceId: biometricData.faceSamples?.length > 0,
        hasFingerprint: biometricData.fingerprintSamples?.length > 0,
        hasQrCode: !!biometricData.qrCode,
        lastUpdated: biometricData.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save employee biometric data
// @route   POST /api/employees/:id/biometrics
// @access  Private
exports.saveEmployeeBiometrics = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const { type, data } = req.body;
    const isAdmin = req.user.role === 'admin';

    // Validate biometric type
    if (!['face', 'fingerprint', 'qrCode'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de données biométriques invalide'
      });
    }

    // Get employee's biometric data
    let biometricData = await Biometric.findOne({ employeeId });
    if (!biometricData) {
      biometricData = new Biometric({ employeeId });
    }

    // Validate data based on type and requirements
    const validationResult = await validateBiometricData(type, data, isAdmin);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    // Save the biometric data
    switch (type) {
      case 'face':
        biometricData.faceSamples.push({
          data: data,
          quality: validationResult.quality,
          timestamp: new Date()
        });
        break;
      case 'fingerprint':
        biometricData.fingerprintSamples.push({
          data: data,
          quality: validationResult.quality,
          timestamp: new Date()
        });
        break;
      case 'qrCode':
        biometricData.qrCode = {
          data: data,
          lastUpdated: new Date()
        };
        break;
    }

    await biometricData.save();

    res.status(200).json({
      success: true,
      data: biometricData
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to validate biometric data
const validateBiometricData = async (type, data, isAdmin) => {
  const config = isAdmin ? biometricsConfig.adminRequirements : biometricsConfig.settings;
  const validation = biometricsConfig.validation;

  switch (type) {
    case 'face':
      // Validate image dimensions and quality
      const imageQuality = await validateImageQuality(data);
      if (imageQuality < config.faceRecognition.qualityThreshold) {
        return {
          success: false,
          message: 'La qualité de l\'image est insuffisante'
        };
      }
      return {
        success: true,
        quality: imageQuality
      };

    case 'fingerprint':
      // Validate fingerprint quality and minutiae
      const fingerprintQuality = await validateFingerprintQuality(data);
      if (fingerprintQuality < config.fingerprint.qualityThreshold) {
        return {
          success: false,
          message: 'La qualité de l\'empreinte est insuffisante'
        };
      }
      return {
        success: true,
        quality: fingerprintQuality
      };

    case 'qrCode':
      // Validate QR code format and content
      const qrCodeValid = await validateQRCode(data);
      if (!qrCodeValid) {
        return {
          success: false,
          message: 'Format de QR code invalide'
        };
      }
      return {
        success: true,
        quality: 1
      };

    default:
      return {
        success: false,
        message: 'Type de données biométriques non supporté'
      };
  }
};

// @desc    Get employee barcode data
// @route   GET /api/employees/:id/barcode
// @access  Private
exports.getEmployeeBarcode = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    
    // In a real app, this would query the database for the employee's barcode
    // or generate one if it doesn't exist
    
    // Mock data for testing
    const barcodeData = {
      employeeId,
      barcodeType: 'CODE128',
      barcodeData: employeeId,
      qrCodeData: `EMPLOYEE:${employeeId}`,
      generatedAt: new Date(),
      isActive: true
    };
    
    res.status(200).json(barcodeData);
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee biometric status
// @route   PUT /api/employees/:id/biometric-status
// @access  Private
exports.updateBiometricStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { biometricType, status, samplesCount } = req.body;
    
    // Validate biometric type
    if (!['faceRecognition', 'fingerprint'].includes(biometricType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de biométrie invalide'
      });
    }
    
    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'completed', 'validated', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const updateData = {};
    
    // Update status if provided
    if (status) {
      updateData[`biometricStatus.${biometricType}.status`] = status;
      updateData[`biometricStatus.${biometricType}.lastUpdated`] = new Date();
      
      // If status is completed, set enrollment date
      if (status === 'completed') {
        updateData[`biometricStatus.${biometricType}.enrolled`] = true;
        updateData[`biometricStatus.${biometricType}.enrollmentDate`] = new Date();
      }
      
      // If status is validated or rejected, set validation info
      if (status === 'validated' || status === 'rejected') {
        updateData[`biometricStatus.${biometricType}.validatedBy`] = req.user.id;
        updateData[`biometricStatus.${biometricType}.validationDate`] = new Date();
      }
    }
    
    // Update samples count if provided
    if (samplesCount !== undefined) {
      updateData[`biometricStatus.${biometricType}.samplesCount`] = samplesCount;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('department');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employé avec l'id ${id} non trouvé`
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate employee biometric enrollment
// @route   PUT /api/employees/:id/validate-biometric
// @access  Private (Team Leaders and Admins only)
exports.validateBiometricEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { biometricType, decision, notes } = req.body;
    
    // Check permissions (only team leaders and admins can validate)
    if (req.user.role !== 'admin' && req.user.role !== 'team_leader') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Seuls les chefs d\'équipe et administrateurs peuvent valider les données biométriques.'
      });
    }
    
    // Validate biometric type
    if (!['faceRecognition', 'fingerprint'].includes(biometricType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de biométrie invalide'
      });
    }
    
    // Validate decision
    if (!['validated', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Décision invalide. Doit être "validated" ou "rejected"'
      });
    }
    
    const updateData = {
      [`biometricStatus.${biometricType}.status`]: decision,
      [`biometricStatus.${biometricType}.validatedBy`]: req.user.id,
      [`biometricStatus.${biometricType}.validationDate`]: new Date(),
      [`biometricStatus.${biometricType}.lastUpdated`]: new Date()
    };
    
    // Add notes if provided
    if (notes) {
      updateData[`biometricStatus.${biometricType}.validationNotes`] = notes;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('department');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employé avec l'id ${id} non trouvé`
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee biometric status
// @route   GET /api/employees/:id/biometric-status
// @access  Private
exports.getBiometricStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id)
      .select('firstName lastName employeeId biometricStatus')
      .populate('biometricStatus.faceRecognition.validatedBy', 'name email')
      .populate('biometricStatus.fingerprint.validatedBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employé avec l'id ${id} non trouvé`
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee.biometricStatus
    });
  } catch (err) {
    next(err);
  }
}; 