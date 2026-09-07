import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import MainLayout from '../layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RolesManagement from '../pages/Admin/RolesManagement';
import UsersManagement from '../pages/Admin/UsersManagement';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RolesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <RolesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <h2 className="text-lg font-bold text-slate-800">EDUGATE Global CRM Dashboard</h2>
              <p className="text-slate-500 text-xs mt-1">Analytics overview.</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <h2 className="text-lg font-bold text-slate-800">System Settings</h2>
              <p className="text-slate-500 text-xs mt-1">Configure CRM global preferences.</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Fallback to root / login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
