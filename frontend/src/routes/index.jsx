import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import MainLayout from '../layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';
import ProfilePage from '../pages/Auth/ProfilePage';
import RolesManagement from '../pages/Admin/RolesManagement';
import UsersManagement from '../pages/Admin/UsersManagement';
import BranchesManagement from '../pages/Admin/BranchesManagement';
import ClientsManagement from '../pages/Admin/ClientsManagement';
import StudentPipeline from '../pages/Admin/StudentPipeline';
import ConversationsPage from '../pages/Conversation/ConversationsPage';
import MediaManagement from '../pages/Media/MediaManagement';
import GoogleCallback from '../pages/Media/GoogleCallback';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import { getUserRole } from '../utils/roleUtils';
import EventManagement from '../pages/Admin/EventManagement';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import ReferrersManagement from '../pages/Admin/ReferrersManagement';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

function SuperAdminRoute({ children }) {
  const { user } = useAuth();
  const role = getUserRole(user);
  if (role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const role = getUserRole(user);
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
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
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <RolesManagement />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/branches"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <BranchesManagement />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <UsersManagement />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <ClientsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <ProtectedRoute>
            <StudentPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-pipeline"
        element={
          <ProtectedRoute>
            <StudentPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrers"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ReferrersManagement />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations/:id"
        element={
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/media"
        element={
          <ProtectedRoute>
            <MediaManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/media/google/callback"
        element={
          <ProtectedRoute>
            <GoogleCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                <h2 className="text-lg font-bold text-slate-800">System Settings</h2>
                <p className="text-slate-500 text-xs mt-1">Configure CRM global preferences.</p>
              </div>
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback to root / login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
