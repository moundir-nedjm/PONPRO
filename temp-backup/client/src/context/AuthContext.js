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

  // Mock users for demonstration
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@poinpro.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: '2',
      name: 'Chef KBK FROID',
      email: 'chef@poinpro.com',
      password: 'chef123',
      role: 'chef',
      projects: ['KBK FROID']
    },
    {
      id: '3',
      name: 'Chef HBK ELEC',
      email: 'hbk@poinpro.com',
      password: 'hbk123',
      role: 'chef',
      projects: ['HBK ELEC']
    },
    {
      id: '4',
      name: 'Chef HML',
      email: 'hml@poinpro.com',
      password: 'hml123',
      role: 'chef',
      projects: ['HML']
    },
    {
      id: '5',
      name: 'Chef REB',
      email: 'reb@poinpro.com',
      password: 'reb123',
      role: 'chef',
      projects: ['REB']
    },
    {
      id: '6',
      name: 'Chef DEG',
      email: 'deg@poinpro.com',
      password: 'deg123',
      role: 'chef',
      projects: ['DEG']
    },
    {
      id: '7',
      name: 'Chef HAMRA',
      email: 'hamra@poinpro.com',
      password: 'hamra123',
      role: 'chef',
      projects: ['HAMRA']
    },
    {
      id: '8',
      name: 'Employee User',
      email: 'employee@poinpro.com',
      password: 'employee123',
      role: 'employee',
      projects: ['KBK FROID']
    }
  ];

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to authenticate with real API first
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          identifier,
          password
        });
        
        if (response.data.success) {
          // Store token if available
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
          }
          
          // Set user data
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
          setLoading(false);
          return true;
        }
      } catch (apiError) {
        console.log('API authentication failed, falling back to mock data:', apiError);
        // Continue to mock authentication if API fails
      }
      
      // Fall back to mock authentication
      const user = mockUsers.find(
        u => (u.email === identifier || u.id === identifier) && u.password === password
      );
      
      if (user) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError('Identifiants invalides');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Erreur de connexion');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Clear user data from state
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    
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