const mongoose = require('mongoose');
const moment = require('moment');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Please provide employee ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide date'],
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      address: String
    },
    device: String,
    notes: String
  },
  checkOut: {
    time: {
      type: Date
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      address: String
    },
    device: String,
    notes: String
  },
  // Legacy status field
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present'
  },
  // Reference to the attendance code
  attendanceCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceCode'
  },
  // For premium amounts if applicable
  premiumAmount: {
    type: Number,
    default: 0
  },
  workHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate work hours when checking out
AttendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkIn.time && this.checkOut && this.checkOut.time) {
    const checkInTime = moment(this.checkIn.time);
    const checkOutTime = moment(this.checkOut.time);
    
    // Calculate work hours
    const duration = moment.duration(checkOutTime.diff(checkInTime));
    this.workHours = parseFloat(duration.asHours().toFixed(2));
    
    // Calculate overtime (assuming 8 hours is standard)
    if (this.workHours > 8) {
      this.overtime = parseFloat((this.workHours - 8).toFixed(2));
    }
    
    // Determine status based on check-in time
    // Assuming work starts at 9:00 AM
    const workStartTime = moment(this.date).set({
      hour: 9,
      minute: 0,
      second: 0
    });
    
    if (checkInTime.isAfter(workStartTime.clone().add(15, 'minutes'))) {
      this.status = 'late';
    }
  }
  
  next();
});

// Index for efficient queries
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema); 