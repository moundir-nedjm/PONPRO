import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL = 'http://localhost:5000/api';

/**
 * Service for handling biometric operations
 * Provides methods for fetching, updating, and validating biometric data
 */
const BiometricService = {
  /**
   * Fetch biometric status for an employee
   * @param {string} employeeId - The ID of the employee
   * @returns {Promise} - The biometric status data
   */
  getBiometricStatus: async (employeeId) => {
    try {
      const response = await axios.get(`/employees/${employeeId}/biometric-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching biometric status:', error);
      throw error;
    }
  },

  /**
   * Update biometric status for an employee
   * @param {string} employeeId - The ID of the employee
   * @param {string} biometricType - The type of biometric (faceRecognition or fingerprint)
   * @param {string} status - The new status
   * @param {number} samplesCount - The number of samples
   * @returns {Promise} - The updated biometric status
   */
  updateBiometricStatus: async (employeeId, biometricType, status, samplesCount) => {
    try {
      const response = await axios.put(`/employees/${employeeId}/biometric-status`, {
        biometricType,
        status,
        samplesCount
      });
      return response.data;
    } catch (error) {
      console.error('Error updating biometric status:', error);
      throw error;
    }
  },

  /**
   * Validate biometric enrollment for an employee
   * @param {string} employeeId - The ID of the employee
   * @param {string} biometricType - The type of biometric (faceRecognition or fingerprint)
   * @param {string} decision - The validation decision (validated or rejected)
   * @param {string} notes - Optional notes for the validation
   * @returns {Promise} - The validation result
   */
  validateBiometricEnrollment: async (employeeId, biometricType, decision, notes) => {
    try {
      const response = await axios.put(`/employees/${employeeId}/validate-biometric`, {
        biometricType,
        decision,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error validating biometric enrollment:', error);
      throw error;
    }
  },

  /**
   * Get biometric data for an employee
   * @param {string} employeeId - The ID of the employee
   * @returns {Promise} - The biometric data
   */
  getBiometricData: async (employeeId) => {
    try {
      const response = await axios.get(`/employees/${employeeId}/biometrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching biometric data:', error);
      throw error;
    }
  },

  /**
   * Save biometric data for an employee
   * @param {string} employeeId - The ID of the employee
   * @param {string} type - The type of biometric (face, fingerprint, qrCode)
   * @param {Object} data - The biometric data to save
   * @returns {Promise} - The saved biometric data
   */
  saveBiometricData: async (employeeId, type, data) => {
    try {
      const response = await axios.post(`/employees/${employeeId}/biometrics`, {
        type,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error saving biometric data:', error);
      throw error;
    }
  },

  /**
   * Save a biometric scan
   * @param {string} employeeId - The ID of the employee
   * @param {string} type - The type of biometric (faceRecognition, fingerprint)
   * @param {string} data - The biometric data
   * @param {number} quality - The quality score of the scan (0-100)
   * @param {string} pose - Optional pose type for face scans (straight, left, right)
   * @returns {Promise} - The result of the save operation
   */
  saveBiometricScan: async (employeeId, type, data, quality, pose) => {
    try {
      const response = await axios.post('/biometrics/scan', {
        employeeId,
        type,
        data,
        quality,
        pose
      });
      return response.data;
    } catch (error) {
      console.error('Error saving biometric scan:', error);
      throw error;
    }
  },

  /**
   * Get biometric samples for an employee
   * @param {string} employeeId - The ID of the employee
   * @param {string} type - The type of biometric (faceRecognition, fingerprint)
   * @returns {Promise} - The biometric samples
   */
  getBiometricSamples: async (employeeId, type) => {
    try {
      const response = await axios.get(`/biometrics/samples/${employeeId}/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching biometric samples:', error);
      throw error;
    }
  },

  /**
   * Get team members for a team leader
   * @returns {Promise} - List of team members
   */
  getTeamMembers: async () => {
    try {
      const response = await axios.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Capture face biometric data
   * This would normally connect to a camera API
   * @returns {Promise} - Face capture result
   */
  captureFace: async () => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, this would connect to a webcam API
      // and capture actual face data
      return {
        success: true,
        image: 'data:image/jpeg;base64,' + btoa(Math.random().toString(36)), // Random mock data
        quality: Math.floor(Math.random() * 30) + 70, // Random quality between 70-100
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error capturing face:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture face'
      };
    }
  },

  /**
   * Capture fingerprint biometric data
   * This would normally connect to a fingerprint scanner
   * @returns {Promise} - Fingerprint capture result
   */
  captureFingerprint: async () => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, this would connect to a fingerprint reader API
      // and capture actual fingerprint data
      return {
        success: true,
        data: btoa(Math.random().toString(36)), // Random mock data
        quality: Math.floor(Math.random() * 30) + 70, // Random quality between 70-100
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error capturing fingerprint:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture fingerprint'
      };
    }
  }
};

export default BiometricService; 