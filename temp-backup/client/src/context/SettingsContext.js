import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

// Default settings
const defaultSettings = {
  general: {
    language: 'fr',
    timeZone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultView: 'monthly',
    startDayOfWeek: 1 // Monday
  },
  appearance: {
    theme: 'light',
    density: 'comfortable',
    fontSize: 'medium',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    borderRadius: 'medium',
    enableAnimations: true,
    tableLayout: 'standard',
    menuStyle: 'standard'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    emailAddresses: [],
    phoneNumbers: [],
    notifyOnLeaveRequest: true,
    notifyOnAttendanceChange: true,
    notifyOnDocumentUpdate: true,
    notifyOnSystemUpdates: true,
    dailyDigest: false,
    weeklyDigest: true
  },
  security: {
    sessionTimeout: 30, // Minutes
    allowMultipleDevices: true,
    requirePasswordChange: 90, // Days
    autoLockScreen: true,
    autoLockTimeout: 5, // Minutes
    twoFactorAuth: false,
    ipRestriction: false,
    allowedIps: []
  }
};

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({
    message: '',
    severity: 'info',
    show: false
  });

  // Load settings when user changes
  useEffect(() => {
    if (currentUser) {
      loadSettings();
    } else {
      // Reset to defaults if no user
      setSettings(defaultSettings);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Load settings from localStorage or API
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Try to get from API first
      const response = await axios.get('/api/settings/user');
      if (response.data && response.data.success) {
        setSettings(response.data.data);
      } else {
        // Fallback to localStorage
        const storedSettings = localStorage.getItem(`poinpro_settings_${currentUser.id}`);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      }
    } catch (error) {
      console.log('Error loading settings, using fallback:', error);
      // Fallback to localStorage
      const storedSettings = localStorage.getItem(`poinpro_settings_${currentUser.id}`);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings to localStorage and API if available
  const saveSettings = async (newSettings = settings) => {
    setIsLoading(true);
    try {
      // Always save to localStorage as a fallback
      localStorage.setItem(`poinpro_settings_${currentUser.id}`, JSON.stringify(newSettings));
      
      // Try to save to API
      try {
        await axios.post('/api/settings/user', newSettings);
        showStatus('Paramètres enregistrés avec succès', 'success');
      } catch (apiError) {
        console.log('Could not save settings to API, saved to localStorage only:', apiError);
        showStatus('Paramètres enregistrés localement', 'warning');
      }
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showStatus('Échec de l\'enregistrement des paramètres', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update a specific section of the settings
  const updateSettings = (section, sectionSettings) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        ...sectionSettings
      }
    };
    
    saveSettings(newSettings);
  };

  // Reset settings to default
  const resetSettings = async (section) => {
    if (section) {
      // Reset only a specific section
      const newSettings = {
        ...settings,
        [section]: defaultSettings[section]
      };
      saveSettings(newSettings);
    } else {
      // Reset all settings
      saveSettings(defaultSettings);
    }
    
    showStatus(`Paramètres ${section ? section : ''} réinitialisés avec succès`, 'success');
  };

  // Export settings to a file
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `poinpro_settings_${currentUser.id}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('Paramètres exportés avec succès', 'success');
  };

  // Import settings from a file
  const importSettings = (jsonData) => {
    try {
      const parsedSettings = JSON.parse(jsonData);
      
      // Validate that the settings have the expected structure
      if (!parsedSettings.general || !parsedSettings.appearance || 
          !parsedSettings.notifications || !parsedSettings.security) {
        throw new Error('Invalid settings file format');
      }
      
      saveSettings(parsedSettings);
      showStatus('Paramètres importés avec succès', 'success');
    } catch (error) {
      console.error('Failed to import settings:', error);
      showStatus('Échec de l\'importation des paramètres. Format de fichier invalide.', 'error');
    }
  };

  // Show a status message
  const showStatus = (message, severity = 'info') => {
    setStatus({
      message,
      severity,
      show: true
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        show: false
      }));
    }, 3000);
  };

  const contextValue = {
    settings,
    isLoading,
    status,
    saveSettings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    showStatus
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 