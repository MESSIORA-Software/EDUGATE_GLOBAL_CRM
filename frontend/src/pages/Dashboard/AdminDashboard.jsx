import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  UserCheck,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth ?? {});

  return (
    <div className="space-y-5 max-w-full mx-auto">
            {/* Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Branch Dashboard
            </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Branch administration metrics, student allocations, and daily staff activities.
          </p>
        </div>
      </div>

      {/* Scope / Restriction Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Administrative Permission Policy</p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            System entity configuration (Roles, Global Branches, and Staff Account Provisioning) is centrally governed by the <strong>Super Administrator</strong>. Management features are currently reserved for Super Admin accounts.
          </p>
        </div>
      </div>

      {/* Branch Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Branch Status</p>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">Online</p>
            <span className="text-[10px] text-emerald-600 font-medium">Branch operations running</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Access Level</p>
            <p className="text-xl font-extrabold text-indigo-900 mt-0.5">ADMIN</p>
            <span className="text-[10px] text-indigo-600 font-medium">Standard Administrator</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account Profile</p>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">{user?.status || 'ACTIVE'}</p>
            <span className="text-[10px] text-slate-500 font-medium">Verified account status</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          My Account & Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
            <p className="font-bold text-slate-800 mt-0.5">{user?.name || 'Admin User'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
            <p className="font-bold text-slate-800 mt-0.5">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <NavLink
            to="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            <span>Manage My Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
