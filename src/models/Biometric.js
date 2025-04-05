const mongoose = require('mongoose');
const crypto = require('crypto');
const biometricsConfig = require('../config/biometrics.config');

const biometricSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  faceSamples: [{
    data: {
      type: String,
      required: true,
      set: function(value) {
        // Encrypt the biometric data before storing
        const iv = crypto.randomBytes(biometricsConfig.security.encryption.ivLength);
        const cipher = crypto.createCipheriv(
          biometricsConfig.security.encryption.algorithm,
          Buffer.from(process.env.BIOMETRIC_ENCRYPTION_KEY),
          iv
        );
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
      }
    },
    quality: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  fingerprintSamples: [{
    data: {
      type: String,
      required: true,
      set: function(value) {
        // Encrypt the biometric data before storing
        const iv = crypto.randomBytes(biometricsConfig.security.encryption.ivLength);
        const cipher = crypto.createCipheriv(
          biometricsConfig.security.encryption.algorithm,
          Buffer.from(process.env.BIOMETRIC_ENCRYPTION_KEY),
          iv
        );
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
      }
    },
    quality: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  qrCode: {
    data: {
      type: String,
      required: true,
      set: function(value) {
        // Encrypt the QR code data before storing
        const iv = crypto.randomBytes(biometricsConfig.security.encryption.ivLength);
        const cipher = crypto.createCipheriv(
          biometricsConfig.security.encryption.algorithm,
          Buffer.from(process.env.BIOMETRIC_ENCRYPTION_KEY),
          iv
        );
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  failedAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date
    }
  },
  lockedUntil: {
    type: Date
  },
  type: {
    type: String,
    enum: ['fingerprint', 'face', 'nfc', 'card'],
    default: 'fingerprint',
    required: true
  },
  template: {
    type: String,
    required: true
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  cardId: {
    type: String,
    required: function() {
      return this.type === 'nfc' || this.type === 'card';
    }
  },
  lastAuthenticated: {
    type: Date
  },
  authenticationHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    success: {
      type: Boolean,
      required: true
    },
    device: {
      type: String
    },
    location: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Method to decrypt biometric data
biometricSchema.methods.decryptData = function(encryptedData) {
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    biometricsConfig.security.encryption.algorithm,
    Buffer.from(process.env.BIOMETRIC_ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Method to check if biometrics are locked
biometricSchema.methods.isLocked = function() {
  if (this.lockedUntil && this.lockedUntil > new Date()) {
    return true;
  }
  return false;
};

// Method to handle failed attempts
biometricSchema.methods.handleFailedAttempt = function() {
  this.failedAttempts.count += 1;
  this.failedAttempts.lastAttempt = new Date();
  
  if (this.failedAttempts.count >= biometricsConfig.security.accessControl.maxFailedAttempts) {
    this.lockedUntil = new Date(Date.now() + biometricsConfig.security.accessControl.lockoutDuration);
  }
  
  return this.save();
};

// Method to reset failed attempts
biometricSchema.methods.resetFailedAttempts = function() {
  this.failedAttempts = {
    count: 0,
    lastAttempt: null
  };
  this.lockedUntil = null;
  return this.save();
};

// Method to check if admin requirements are met
biometricSchema.methods.checkAdminRequirements = function() {
  const requirements = biometricsConfig.adminRequirements;
  
  return {
    faceRecognition: this.faceSamples.length >= requirements.faceRecognition.minSamples,
    fingerprint: this.fingerprintSamples.length >= requirements.fingerprint.minSamples,
    qrCode: this.qrCode && 
      new Date(this.qrCode.lastUpdated) > new Date(Date.now() - requirements.qrCode.refreshInterval)
  };
};

// Method to clean up old biometric data
biometricSchema.methods.cleanupOldData = async function() {
  const retentionPeriod = biometricsConfig.security.storage.retentionPeriod;
  const cutoffDate = new Date(Date.now() - retentionPeriod);
  
  // Remove old face samples
  this.faceSamples = this.faceSamples.filter(sample => 
    sample.timestamp > cutoffDate
  );
  
  // Remove old fingerprint samples
  this.fingerprintSamples = this.fingerprintSamples.filter(sample => 
    sample.timestamp > cutoffDate
  );
  
  return this.save();
};

module.exports = mongoose.model('Biometric', biometricSchema); 