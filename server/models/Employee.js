const mongoose = require('mongoose');

const BiometricStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'validated', 'rejected'],
    default: 'not_started'
  },
  samplesCount: {
    type: Number,
    default: 0
  },
  enrollmentDate: Date,
  validationDate: Date,
  validationNotes: String
});

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  departmentName: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'chef', 'employee', 'user'],
    default: 'employee'
  },
  password: {
    type: String,
    default: 'changeme123'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  biometricStatus: {
    faceRecognition: {
      type: BiometricStatusSchema,
      default: () => ({})
    },
    fingerprint: {
      type: BiometricStatusSchema,
      default: () => ({})
    }
  }
}, {
  timestamps: true
});

// Add a pre-save hook to ensure proper biometricStatus initialization
EmployeeSchema.pre('save', function(next) {
  // Initialize biometricStatus if not set
  if (!this.biometricStatus) {
    this.biometricStatus = {
      faceRecognition: { status: 'not_started', samplesCount: 0 },
      fingerprint: { status: 'not_started', samplesCount: 0 }
    };
  } else {
    // Initialize faceRecognition if not set
    if (!this.biometricStatus.faceRecognition) {
      this.biometricStatus.faceRecognition = { status: 'not_started', samplesCount: 0 };
    }
    // Initialize fingerprint if not set
    if (!this.biometricStatus.fingerprint) {
      this.biometricStatus.fingerprint = { status: 'not_started', samplesCount: 0 };
    }
  }
  next();
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee; 