import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import RolesManagement from '../pages/Admin/RolesManagement';
import UsersManagement from '../pages/Admin/UsersManagement';

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<RolesManagement />} />
        <Route path="/roles" element={<RolesManagement />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route
          path="/dashboard"
          element={
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <h2 className="text-lg font-bold text-slate-800">EDUGATE Global CRM Dashboard</h2>
              <p className="text-slate-500 text-xs mt-1">Analytics overview.</p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <h2 className="text-lg font-bold text-slate-800">System Settings</h2>
              <p className="text-slate-500 text-xs mt-1">Configure CRM global preferences.</p>
            </div>
          }
        />
      </Routes>
    </MainLayout>
  );
}

export default AppRoutes;
