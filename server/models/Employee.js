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

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee; 