import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Define projects
const PROJECTS = [
  'KBK FROID',
  'HBK ELEC',
  'HML',
  'REB',
  'DEG',
  'HAMRA'
];

// API URL - ensure it's correctly set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axios config - global timeout and retry logic
axios.defaults.timeout = 10000; // 10 seconds timeout

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Get stored user from localStorage
  const getStoredUser = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };

  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store user in localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Configure axios to include auth token in requests
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [isAuthenticated]);

  // Login function with retry logic
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    const loginAttempt = async (retryCount = 0) => {
      try {
        console.log(`Attempting login with: ${email}, retry count: ${retryCount}`);
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          identifier: email,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Login response:', response.data);
        
        if (response.data.success) {
          // Store token if available
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          }
          
          // Set user data
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
          setLoading(false);
          return true;
        } else {
          setError(response.data.message || 'Échec de la connexion');
          setLoading(false);
          return false;
        }
      } catch (err) {
        console.error('Login error:', err);
        
        if (retryCount < 2) { // Allow up to 2 retries
          console.log(`Retrying login attempt (${retryCount + 1})...`);
          return await loginAttempt(retryCount + 1);
        }
        
        if (err.response) {
          // Server responded with an error status
          setError(err.response.data?.message || 'Identifiants invalides');
        } else if (err.request) {
          // Request was made but no response received
          setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        } else {
          // Error in setting up the request
          setError('Erreur lors de la configuration de la demande.');
        }
        
        setLoading(false);
        return false;
      }
    };
    
    return await loginAttempt();
  };

  const logout = () => {
    // Clear user data from state
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Clear auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear any other auth-related data
    setError(null);
  };

  // Check if user has access to a specific project
  const hasProjectAccess = (projectName) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if ((currentUser.role === 'chef' || currentUser.role === 'employee') && currentUser.projects) {
      return currentUser.projects.includes(projectName);
    }
    return false;
  };

  // Check if user has access to a specific feature
  const hasAccess = (requiredRoles) => {
    if (!currentUser || !currentUser.role) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    hasAccess,
    hasProjectAccess,
    PROJECTS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 