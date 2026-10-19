import React from 'react';
import useAuth from '../../hooks/Auth/useAuth';
import { getUserRole } from '../../utils/roleUtils';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = getUserRole(user);

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STAFF':
    default:
      return <StaffDashboard />;
  }
}
