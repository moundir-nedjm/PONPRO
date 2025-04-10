import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import BiometricService from '../services/biometricService';
import { useAuth } from './AuthContext';
import SocketService, { SOCKET_EVENTS } from '../utils/socket';

// Create context
const BiometricContext = createContext();

/**
 * Provider component for biometric data
 * Manages biometric data state and provides methods for interacting with biometric functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const BiometricProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [biometricData, setBiometricData] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to Socket.IO server
    SocketService.connect();

    // Setup connection status tracking
    const handleConnect = () => {
      console.log('Socket connected');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    };

    SocketService.on('connect', handleConnect);
    SocketService.on('disconnect', handleDisconnect);

    // Setup real-time data listeners
    SocketService.on(SOCKET_EVENTS.EMPLOYEE_UPDATED, (employee) => {
      console.log('Real-time: Employee updated', employee);
      updateTeamMember(employee);
      
      // If this is the current user, update their biometric data
      if (currentUser?.id === employee._id) {
        fetchUserBiometricData();
      }
    });
    
    SocketService.on(SOCKET_EVENTS.BIOMETRIC_STATUS_UPDATED, (data) => {
      console.log('Real-time: Biometric status updated', data);
      updateEmployeeBiometricStatus(data.employeeId, data.biometricType, data.status, data.samplesCount);
    });
    
    SocketService.on(SOCKET_EVENTS.BIOMETRIC_VALIDATED, (data) => {
      console.log('Real-time: Biometric enrollment validated', data);
      updateEmployeeBiometricStatus(data.employeeId, data.biometricType, data.status);
    });
    
    SocketService.on(SOCKET_EVENTS.BIOMETRIC_SCAN_COMPLETED, (data) => {
      console.log('Real-time: Biometric scan completed', data);
      updateEmployeeBiometricStatus(data.employeeId, data.type, data.status, data.samplesCount);
    });

    // Clean up event listeners on unmount
    return () => {
      SocketService.off('connect', handleConnect);
      SocketService.off('disconnect', handleDisconnect);
      SocketService.off(SOCKET_EVENTS.EMPLOYEE_UPDATED);
      SocketService.off(SOCKET_EVENTS.BIOMETRIC_STATUS_UPDATED);
      SocketService.off(SOCKET_EVENTS.BIOMETRIC_VALIDATED);
      SocketService.off(SOCKET_EVENTS.BIOMETRIC_SCAN_COMPLETED);
      SocketService.disconnect();
    };
  }, [currentUser]);

  // Update team member in state
  const updateTeamMember = (employee) => {
    setTeamMembers(prev => 
      prev.map(emp => emp._id === employee._id ? employee : emp)
    );
  };

  // Helper function to update employee biometric status locally
  const updateEmployeeBiometricStatus = (employeeId, type, status, samplesCount) => {
    setTeamMembers(prev => 
      prev.map(emp => {
        if (emp._id === employeeId || emp.id === employeeId) {
          const updated = { ...emp };
          
          if (!updated.biometricStatus) {
            updated.biometricStatus = {};
          }
          
          if (!updated.biometricStatus[type]) {
            updated.biometricStatus[type] = {};
          }
          
          if (status) {
            updated.biometricStatus[type].status = status;
          }
          
          if (samplesCount !== undefined) {
            updated.biometricStatus[type].samplesCount = samplesCount;
          }
          
          if (status === 'completed') {
            updated.biometricStatus[type].enrollmentDate = new Date().toISOString();
          }
          
          if (status === 'validated') {
            updated.biometricStatus[type].validationDate = new Date().toISOString();
          }
          
          return updated;
        }
        return emp;
      })
    );
  };

  // Fetch biometric data for the current user
  const fetchUserBiometricData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const response = await BiometricService.getBiometricData(currentUser.id);
      
      if (response && response.success) {
        setBiometricData(response.data);
      } else {
        throw new Error('Failed to fetch biometric data');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching biometric data:', err);
      setError('Erreur lors du chargement des données biométriques');
      
      // Use mock data in case of error
      setBiometricData({
        hasFaceId: false,
        hasFingerprint: false,
        hasQrCode: false,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch team members for team leaders
  const fetchTeamMembers = useCallback(async () => {
    if (!currentUser?.id || (currentUser.role !== 'team_leader' && currentUser.role !== 'chef' && currentUser.role !== 'admin')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await BiometricService.getTeamMembers();
      
      if (response && response.success) {
        setTeamMembers(response.data || []);
        setError(null);
      } else {
        throw new Error('Failed to fetch team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Erreur lors du chargement des membres de l\'équipe');
      
      // Fall back to mock data if API fails
      const mockTeamMembers = [
        // ... include mock data here in case API fails ...
      ];
      
      setTeamMembers(mockTeamMembers);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Handle opening a scan dialog
  const openScanDialog = (type, employee = null) => {
    setScanType(type);
    setSelectedEmployee(employee);
    setScanDialogOpen(true);
    setScanResult(null);
  };

  // Handle closing a scan dialog
  const closeScanDialog = () => {
    setScanDialogOpen(false);
    setScanType(null);
    setScanning(false);
    setScanResult(null);
  };

  // Handle the scan operation
  const handleScan = async () => {
    try {
      setScanning(true);
      
      // Perform scan based on type
      let result;
      if (scanType === 'faceRecognition') {
        result = await BiometricService.captureFace();
      } else {
        result = await BiometricService.captureFingerprint();
      }
      
      setScanResult(result);
      setError(null);
      return result;
    } catch (err) {
      console.error(`Error scanning ${scanType}:`, err);
      setError(`Erreur lors de la numérisation: ${err.message || 'Erreur inconnue'}`);
      return { success: false, error: err.message || 'Erreur inconnue' };
    } finally {
      setScanning(false);
    }
  };

  // Save biometric scan result to server
  const saveBiometricScan = async (employeeId, type, data, quality) => {
    try {
      setLoading(true);
      
      const response = await BiometricService.saveBiometricScan(
        employeeId,
        type,
        data,
        quality
      );
      
      if (response && response.success) {
        // Update handled by socket events, but we can update locally for immediate feedback
        updateEmployeeBiometricStatus(
          employeeId,
          type,
          response.data.status,
          response.data.samplesCount
        );
      } else {
        throw new Error('Failed to save biometric scan');
      }
      
      setError(null);
      return response;
    } catch (err) {
      console.error('Error saving biometric scan:', err);
      setError('Erreur lors de l\'enregistrement des données biométriques');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle saving scan results
  const saveScanResult = async (notes = '') => {
    if (!scanType || !scanResult) return;
    
    try {
      setLoading(true);
      
      // Save scan for user or team member
      const employeeId = selectedEmployee ? selectedEmployee.id : currentUser.id;
      const data = scanType === 'faceRecognition' 
        ? scanResult.image
        : scanResult.data;
      
      await saveBiometricScan(employeeId, scanType, data, scanResult.quality || 80);
      
      closeScanDialog();
      setError(null);
    } catch (err) {
      console.error(`Error saving ${scanType}:`, err);
      setError(`Erreur lors de l'enregistrement: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle validating biometric enrollment
  const validateBiometricEnrollment = async (employee, type, decision, notes = '') => {
    try {
      setLoading(true);
      
      const response = await BiometricService.validateBiometricEnrollment(
        employee.id,
        type,
        decision,
        notes
      );
      
      if (!response || !response.success) {
        throw new Error('Failed to validate biometric enrollment');
      }
      
      // Update handled by socket events, but we can update locally for immediate feedback
      updateEmployeeBiometricStatus(employee.id, type, decision);
      
      setError(null);
    } catch (err) {
      console.error(`Error validating ${type}:`, err);
      setError(`Erreur lors de la validation: ${err.message || 'Erreur inconnue'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    loading,
    error,
    setError,
    biometricData,
    teamMembers,
    selectedEmployee,
    setSelectedEmployee,
    scanDialogOpen,
    scanType,
    scanning,
    scanResult,
    socketConnected,
    fetchUserBiometricData,
    fetchTeamMembers,
    openScanDialog,
    closeScanDialog,
    handleScan,
    saveScanResult,
    saveBiometricScan,
    validateBiometricEnrollment
  };

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
};

/**
 * Custom hook for accessing biometric context
 * @returns {Object} Biometric context value
 */
export const useBiometrics = () => {
  const context = useContext(BiometricContext);
  if (context === undefined) {
    throw new Error('useBiometrics must be used within a BiometricProvider');
  }
  return context;
};

export default BiometricContext; 