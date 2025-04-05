const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['identity', 'education', 'professional', 'health', 'administrative', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedDate: {
    type: Date
  },
  history: [
    {
      action: {
        type: String,
        enum: ['created', 'updated', 'verified', 'rejected', 'shared', 'deleted'],
        required: true
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: {
        type: String
      }
    }
  ]
});

// Pre-save middleware to update lastModified date
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  
  // If status is changing to verified, capture verification details
  if (this.isModified('status') && this.status === 'verified') {
    if (!this.verifiedDate) {
      this.verifiedDate = new Date();
    }
  }
  
  next();
});

// Add history entry middleware method
documentSchema.methods.addHistoryEntry = async function(action, user, details = '') {
  this.history.push({
    action,
    performedBy: user._id,
    timestamp: new Date(),
    details
  });
  
  await this.save();
};

// Static method to find documents by category
documentSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

// Static method to find documents by user (with optional status filter)
documentSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ uploadDate: -1 });
};

// Static method to find pending documents
documentSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ uploadDate: 1 });
};

// Create the model
const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 