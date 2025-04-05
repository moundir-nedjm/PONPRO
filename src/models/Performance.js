const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  ratings: {
    productivity: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    initiative: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    teamwork: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    adaptability: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  attendanceMetrics: {
    presentDays: {
      type: Number,
      default: 0
    },
    absentDays: {
      type: Number,
      default: 0
    },
    lateDays: {
      type: Number,
      default: 0
    },
    leaveDays: {
      type: Number,
      default: 0
    },
    attendanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  goals: [{
    description: {
      type: String,
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievementPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    comments: String
  }],
  strengths: [String],
  areasForImprovement: [String],
  comments: String,
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  developmentPlan: {
    training: [String],
    mentoring: [String],
    projects: [String]
  },
  acknowledgement: {
    employeeAcknowledged: {
      type: Boolean,
      default: false
    },
    employeeAcknowledgedAt: Date,
    employeeComments: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'acknowledged', 'finalized'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating average rating
PerformanceSchema.virtual('averageRating').get(function() {
  const ratings = this.ratings;
  const sum = Object.values(ratings).reduce((total, rating) => total + rating, 0);
  return (sum / Object.keys(ratings).length).toFixed(2);
});

module.exports = mongoose.model('Performance', PerformanceSchema); 