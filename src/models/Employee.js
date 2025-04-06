const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  employeeId: {
    type: String,
    required: [true, 'Please provide employee ID'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Please provide position'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please provide department']
  },
  hireDate: {
    type: Date,
    required: [true, 'Please provide hire date'],
    default: Date.now
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    wilaya: {
      type: String,
      required: [true, 'Please provide wilaya'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide postal code'],
      trim: true
    }
  },
  nationalId: {
    type: String,
    required: [true, 'Please provide national ID'],
    unique: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: [true, 'Please provide birth date']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Please specify gender']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Added biometric enrollment tracking fields
  biometricStatus: {
    faceRecognition: {
      enrolled: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'validated', 'rejected'],
        default: 'not_started'
      },
      enrollmentDate: Date,
      lastUpdated: Date,
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      validationDate: Date,
      validationNotes: String,
      samplesCount: {
        type: Number,
        default: 0
      }
    },
    fingerprint: {
      enrolled: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'validated', 'rejected'],
        default: 'not_started'
      },
      enrollmentDate: Date,
      lastUpdated: Date,
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      validationDate: Date,
      validationNotes: String,
      samplesCount: {
        type: Number,
        default: 0
      }
    }
  }
});

// Create full name virtual
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Enable virtuals
EmployeeSchema.set('toJSON', { virtuals: true });
EmployeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', EmployeeSchema); 