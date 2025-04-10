/**
 * Utility functions for biometric operations
 */

/**
 * Check if a biometric sample has sufficient quality
 * @param {number} quality - Quality score between 0 and 1
 * @param {number} threshold - Minimum acceptable quality (default: 0.6)
 * @returns {boolean} Whether the sample quality is acceptable
 */
export const hasSufficientQuality = (quality, threshold = 0.6) => {
  return quality >= threshold;
};

/**
 * Format a date for display in the UI
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string (default: 'fr-FR')
 * @returns {string} Formatted date string
 */
export const formatBiometricDate = (date, locale = 'fr-FR') => {
  if (!date) return 'Non disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get color code based on biometric status
 * @param {string} status - Biometric status
 * @returns {string} Color code (primary, success, error, warning, etc.)
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'validated':
      return 'success';
    case 'rejected':
      return 'error';
    case 'completed':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'not_started':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Get a text description for a biometric status
 * @param {string} status - Biometric status
 * @returns {string} Human-readable status description
 */
export const getStatusDescription = (status) => {
  switch (status) {
    case 'validated':
      return 'Les données biométriques ont été validées et sont actives';
    case 'rejected':
      return 'Les données biométriques ont été rejetées et doivent être recapturées';
    case 'completed':
      return 'Les données biométriques sont en attente de validation';
    case 'in_progress':
      return 'Le processus d\'enregistrement a commencé mais n\'est pas terminé';
    case 'not_started':
      return 'Le processus d\'enregistrement n\'a pas encore commencé';
    default:
      return 'Statut inconnu';
  }
};

/**
 * Calculate the number of biometric samples needed
 * @param {Object} biometricStatus - Current biometric status object
 * @param {string} type - Biometric type (faceRecognition or fingerprint)
 * @param {number} requiredSamples - Required number of samples
 * @returns {number} Number of additional samples needed
 */
export const calculateSamplesNeeded = (biometricStatus, type, requiredSamples = 3) => {
  if (!biometricStatus || !biometricStatus[type]) return requiredSamples;
  
  const currentSamples = biometricStatus[type].samplesCount || 0;
  return Math.max(0, requiredSamples - currentSamples);
};

/**
 * Check if a user can perform biometric operations on an employee
 * @param {string} userRole - Role of the current user
 * @param {string} action - Action to perform (scan, validate, etc.)
 * @returns {boolean} Whether the user has permission
 */
export const canPerformBiometricAction = (userRole, action) => {
  // Team leaders and admins can do all actions
  if (userRole === 'admin' || userRole === 'team_leader' || userRole === 'chef') {
    return true;
  }
  
  // Employees can only scan their own biometrics
  if (userRole === 'employee' && action === 'scan_self') {
    return true;
  }
  
  return false;
}; 