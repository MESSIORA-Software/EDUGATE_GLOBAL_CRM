import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Users,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth ?? {});
  const { list: branches } = useSelector((state) => state.branch ?? {});

  const matchedBranch = branches?.find(
    (b) => (b.branch_id || b.id) == user?.branch_id
  );
  const branchName =
    user?.branch_name ||
    matchedBranch?.branch_name ||
    matchedBranch?.name ||
    `Branch #${user?.branch_id || 1}`;

  return (
    <div className="space-y-5 max-w-full mx-auto">
      {/* Admin Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 p-6 text-white shadow-md border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Admin Workspace Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
              Welcome to the Edugate Global CRM Admin Dashboard. Here you can monitor branch-level operations and communications.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-3 shrink-0">
            <Building2 className="w-4 h-4 text-indigo-300" />
            <div>
              <p className="text-[10px] text-indigo-200 font-semibold uppercase">Assigned Location</p>
              <p className="text-xs text-white font-bold">{branchName}</p>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
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
