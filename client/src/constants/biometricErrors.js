/**
 * Constants for biometric error messages
 * Centralizes error messages for biometric operations
 */
export const BIOMETRIC_ERRORS = {
  FETCH_TEAM_MEMBERS: 'Erreur lors du chargement des membres de l\'équipe',
  FETCH_BIOMETRIC_DATA: 'Erreur lors du chargement des données biométriques',
  FACE_SCAN_FAILED: 'Échec de la numérisation du visage',
  FINGERPRINT_SCAN_FAILED: 'Échec de la numérisation de l\'empreinte digitale',
  SAVE_FACE_FAILED: 'Échec de l\'enregistrement des données du visage',
  SAVE_FINGERPRINT_FAILED: 'Échec de l\'enregistrement des données d\'empreinte',
  VALIDATION_FAILED: 'Échec de la validation des données biométriques',
  PERMISSION_DENIED: 'Vous n\'avez pas les permissions nécessaires pour cette action',
  CAMERA_ACCESS_DENIED: 'L\'accès à la caméra a été refusé',
  SCANNER_ACCESS_DENIED: 'L\'accès au scanner d\'empreintes a été refusé',
  QUALITY_TOO_LOW: 'La qualité de l\'échantillon est trop basse',
  UNKNOWN_ERROR: 'Une erreur inconnue s\'est produite'
};

/**
 * Default error messages by biometric type
 */
export const DEFAULT_ERROR_BY_TYPE = {
  faceRecognition: BIOMETRIC_ERRORS.FACE_SCAN_FAILED,
  fingerprint: BIOMETRIC_ERRORS.FINGERPRINT_SCAN_FAILED
};

/**
 * Get appropriate error message based on error type and additional info
 * @param {string} code - The error code
 * @param {string} type - The biometric type (optional)
 * @param {string} message - Additional error message (optional)
 * @returns {string} The formatted error message
 */
export const getBiometricErrorMessage = (code, type = '', message = '') => {
  const defaultMessage = type 
    ? DEFAULT_ERROR_BY_TYPE[type] || BIOMETRIC_ERRORS.UNKNOWN_ERROR
    : BIOMETRIC_ERRORS.UNKNOWN_ERROR;
    
  const errorMessage = BIOMETRIC_ERRORS[code] || defaultMessage;
  
  return message ? `${errorMessage}: ${message}` : errorMessage;
}; 