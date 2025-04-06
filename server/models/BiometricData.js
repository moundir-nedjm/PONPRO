const mongoose = require('mongoose');

const BiometricDataSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    enum: ['faceRecognition', 'fingerprint'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  quality: {
    type: Number,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  pose: {
    type: String,
    enum: ['front', 'left', 'right', 'up', 'down'],
    default: 'front'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
BiometricDataSchema.index({ employeeId: 1, type: 1 });

const BiometricData = mongoose.model('BiometricData', BiometricDataSchema);

module.exports = BiometricData; 