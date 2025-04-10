import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminSettings from '../pages/admin/Settings';
import UserManagement from '../pages/admin/UserManagement';
import NotFound from '../pages/errors/NotFound';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes; 