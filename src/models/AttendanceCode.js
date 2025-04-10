const mongoose = require('mongoose');

const AttendanceCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code est requis'],
    unique: true,
    trim: true,
    maxlength: [10, 'Le code ne peut pas dépasser 10 caractères']
  },
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [200, 'La description ne peut pas dépasser 200 caractères']
  },
  category: {
    type: String,
    enum: ['present', 'absent', 'leave', 'holiday', 'other', 'mission'],
    default: 'present'
  },
  color: {
    type: String,
    default: '#4682B4', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Veuillez fournir un code couleur hexadécimal valide']
  },
  influencer: {
    type: Boolean,
    default: false
  },
  paymentImpact: {
    type: String,
    enum: ['full-pay', 'partial-pay', 'no-pay', 'premium'],
    default: 'full-pay'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field on save
AttendanceCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AttendanceCode', AttendanceCodeSchema); 