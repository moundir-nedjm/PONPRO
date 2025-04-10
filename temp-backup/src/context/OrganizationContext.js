import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const OrganizationContext = createContext();

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = ({ children }) => {
  const [organizationSettings, setOrganizationSettings] = useState({
    companyName: 'POINPRO Enterprises',
    legalName: 'POINPRO Technologies S.A.R.L',
    taxId: '123456789',
    industry: 'Information Technology',
    website: 'https://poinpro.com',
    email: 'contact@poinpro.com',
    phone: '+212 522 123 456',
    address: {
      street: '123 Avenue Mohammed V',
      city: 'Casablanca',
      state: 'Grand Casablanca',
      postalCode: '20250',
      country: 'Morocco'
    },
    workHours: {
      startTime: '09:00',
      endTime: '17:00',
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      lunchBreak: {
        enabled: true,
        startTime: '12:00',
        duration: 60 // minutes
      }
    },
    timeZone: 'Africa/Casablanca',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    fiscalYearStart: '01-01', // January 1st
    weekStart: 1, // Monday
    language: 'fr',
    logo: null,
    notifications: {
      adminEmails: ['admin@poinpro.com'],
      dailyReports: true,
      weeklyReports: true,
      monthlyReports: true,
      irregularAttendance: true,
      leaveRequests: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load organization settings from API or localStorage on mount
  useEffect(() => {
    loadOrganizationSettings();
  }, []);

  const loadOrganizationSettings = async () => {
    setLoading(true);
    try {
      // Try to get from localStorage first
      const savedSettings = localStorage.getItem('organizationSettings');
      if (savedSettings) {
        setOrganizationSettings(JSON.parse(savedSettings));
      } else {
        // If not in localStorage, try API
        // Uncomment when API is ready
        // const response = await axios.get('/api/organization/settings');
        // setOrganizationSettings(response.data);
        // Save to localStorage
        // localStorage.setItem('organizationSettings', JSON.stringify(response.data));
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load organization settings:', err);
      setError('Impossible de charger les paramètres de l\'organisation.');
    } finally {
      setLoading(false);
    }
  };

  const saveOrganizationSettings = async (settings) => {
    setLoading(true);
    try {
      // Update state
      setOrganizationSettings(settings);
      
      // Save to localStorage
      localStorage.setItem('organizationSettings', JSON.stringify(settings));
      
      // Save to API
      // Uncomment when API is ready
      // await axios.post('/api/organization/settings', settings);
      
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Failed to save organization settings:', err);
      setError('Impossible d\'enregistrer les paramètres de l\'organisation.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationSettings = async (updatedSettings) => {
    // Merge current settings with updates
    const newSettings = {
      ...organizationSettings,
      ...updatedSettings
    };
    return saveOrganizationSettings(newSettings);
  };
  
  const getCompanyName = () => {
    return organizationSettings.companyName || 'POINPRO';
  };
  
  const getWorkHours = () => {
    return organizationSettings.workHours;
  };
  
  const getWorkDays = () => {
    return organizationSettings.workHours.workDays;
  };
  
  const getDateFormat = () => {
    return organizationSettings.dateFormat;
  };
  
  const getTimeFormat = () => {
    return organizationSettings.timeFormat;
  };
  
  const getLanguage = () => {
    return organizationSettings.language;
  };
  
  const getTimeZone = () => {
    return organizationSettings.timeZone;
  };
  
  const getLogo = () => {
    return organizationSettings.logo;
  };

  const value = {
    organizationSettings,
    loading,
    error,
    loadOrganizationSettings,
    saveOrganizationSettings,
    updateOrganizationSettings,
    getCompanyName,
    getWorkHours,
    getWorkDays,
    getDateFormat,
    getTimeFormat,
    getLanguage,
    getTimeZone,
    getLogo
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext; 