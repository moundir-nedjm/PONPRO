const mongoose = require('mongoose');

const AttendanceCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code est requis'],
    unique: true,
    trim: true,
    maxlength: [10, 'Le code ne peut pas dépasser 10 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [100, 'La description ne peut pas dépasser 100 caractères']
  },
  color: {
    type: String,
    default: '#3f51b5', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Veuillez fournir un code couleur hexadécimal valide']
  },
  category: {
    type: String,
    enum: ['présence', 'absence', 'congé', 'autre'],
    default: 'présence'
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