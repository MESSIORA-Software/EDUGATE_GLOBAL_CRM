import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import RolesManagement from '../pages/Admin/RolesManagement';

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<RolesManagement />} />
        <Route path="/roles" element={<RolesManagement />} />
        <Route
          path="/users"
          element={
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800">User Accounts Management</h2>
              <p className="text-slate-500 text-sm mt-1">User management module configured with Redux.</p>
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800">EDUGATE CRM Dashboard</h2>
              <p className="text-slate-500 text-sm mt-1">Global CRM analytics overview.</p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
              <p className="text-slate-500 text-sm mt-1">Configure global application parameters.</p>
            </div>
          }
        />
      </Routes>
    </MainLayout>
  );
}

export default AppRoutes;
