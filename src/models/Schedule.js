const mongoose = require('mongoose');
const moment = require('moment');

const ScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a schedule title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  workingDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  shifts: [{
    name: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
    },
    breakDuration: {
      type: Number,
      default: 60,
      min: 0,
      max: 240
    },
    color: {
      type: String,
      default: '#3498db'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  recurrenceEndDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3498db'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual property for total weekly hours
ScheduleSchema.virtual('weeklyHours').get(function() {
  let totalMinutes = 0;
  
  this.shifts.forEach(shift => {
    const startTimeParts = shift.startTime.split(':');
    const endTimeParts = shift.endTime.split(':');
    
    const startMinutes = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
    const endMinutes = parseInt(endTimeParts[0]) * 60 + parseInt(endTimeParts[1]);
    
    // Handle shifts that go past midnight
    let shiftMinutes = endMinutes - startMinutes;
    if (shiftMinutes < 0) {
      shiftMinutes += 24 * 60; // Add a full day in minutes
    }
    
    // Subtract break duration
    const netMinutes = shiftMinutes - shift.breakDuration;
    
    // Only count if this shift is on a working day
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[shift.dayOfWeek];
    
    if (this.workingDays[dayName]) {
      totalMinutes += netMinutes;
    }
  });
  
  // Convert to hours with 2 decimal places
  return (totalMinutes / 60).toFixed(2);
});

// Method to check if a date falls within the schedule
ScheduleSchema.methods.isDateInSchedule = function(date) {
  const checkDate = moment(date);
  const startDate = moment(this.startDate);
  
  // Check if date is after start date
  if (checkDate.isBefore(startDate, 'day')) {
    return false;
  }
  
  // Check if date is before end date (if set)
  if (this.endDate && checkDate.isAfter(moment(this.endDate), 'day')) {
    return false;
  }
  
  // Check recurrence pattern
  if (this.isRecurring) {
    if (this.recurrenceEndDate && checkDate.isAfter(moment(this.recurrenceEndDate), 'day')) {
      return false;
    }
    
    const daysSinceStart = checkDate.diff(startDate, 'days');
    
    if (this.recurrencePattern === 'daily') {
      return true;
    } else if (this.recurrencePattern === 'weekly') {
      return daysSinceStart % 7 === 0;
    } else if (this.recurrencePattern === 'biweekly') {
      return daysSinceStart % 14 === 0;
    } else if (this.recurrencePattern === 'monthly') {
      return checkDate.date() === startDate.date();
    }
  } else {
    // Non-recurring schedule, check if date is the exact start date
    return checkDate.isSame(startDate, 'day');
  }
  
  return false;
};

module.exports = mongoose.model('Schedule', ScheduleSchema); 