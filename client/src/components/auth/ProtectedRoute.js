import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ element, allowedRoles, children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // If no specific element or children are provided, just protect the route
  if (!element && !children) {
    return isAuthenticated ? <div>Protected Content</div> : <Navigate to="/login" />;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(currentUser?.role);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" />;
    }
  }
  
  // User is authenticated and has permission, render the protected content
  return element || children;
};

export default ProtectedRoute; 