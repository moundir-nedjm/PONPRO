const biometricsConfig = {
  // Admin biometric requirements
  adminRequirements: {
    faceRecognition: {
      required: true,
      minSamples: 3,
      qualityThreshold: 0.8,
      maxRetries: 3
    },
    fingerprint: {
      required: true,
      minSamples: 3,
      qualityThreshold: 0.8,
      maxRetries: 3
    },
    qrCode: {
      required: true,
      refreshInterval: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // General biometric settings
  settings: {
    faceRecognition: {
      enabled: true,
      minSamples: 2,
      qualityThreshold: 0.7,
      maxRetries: 2,
      supportedFormats: ['image/jpeg', 'image/png'],
      maxFileSize: 5 * 1024 * 1024 // 5MB
    },
    fingerprint: {
      enabled: true,
      minSamples: 2,
      qualityThreshold: 0.7,
      maxRetries: 2,
      supportedDevices: [
        'Digital Persona U.are.U 4500',
        'Suprema BioMini',
        'ZKTeco ZK4500',
        'HID DigitalPersona 5160'
      ]
    },
    qrCode: {
      enabled: true,
      refreshInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      size: 200,
      errorCorrectionLevel: 'H'
    }
  },

  // Security settings
  security: {
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16
    },
    storage: {
      type: 'encrypted',
      retentionPeriod: 365 * 24 * 60 * 60 * 1000 // 1 year
    },
    accessControl: {
      requireAdminApproval: true,
      maxFailedAttempts: 3,
      lockoutDuration: 30 * 60 * 1000 // 30 minutes
    }
  },

  // Validation rules
  validation: {
    faceImage: {
      minWidth: 640,
      minHeight: 480,
      maxWidth: 1920,
      maxHeight: 1080,
      minFaceSize: 100,
      maxFaceSize: 500
    },
    fingerprint: {
      minQuality: 60,
      maxQuality: 100,
      minMinutiae: 20,
      maxMinutiae: 100
    }
  }
};

module.exports = biometricsConfig; 