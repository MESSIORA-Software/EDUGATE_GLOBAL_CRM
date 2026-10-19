import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  UserCheck,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';

export default function StaffDashboard() {
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

  const roleName = user?.role_name || user?.role_id || 'Staff Member';

  return (
    <div className="space-y-5 max-w-full mx-auto">
      {/* Staff Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white shadow-md border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Staff Counseling & Operations Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Staff Member'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Edugate Global CRM Staff Desk. Your daily workspace for client counseling, follow-ups, and student communication.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-3 shrink-0">
            <Building2 className="w-4 h-4 text-emerald-300" />
            <div>
              <p className="text-[10px] text-emerald-200 font-semibold uppercase">Assigned Branch</p>
              <p className="text-xs text-white font-bold">{branchName}</p>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Scope / Restriction Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Staff Access Scope</p>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            You are operating with <strong>{roleName}</strong> access. System configuration (Roles, Branches, and System Accounts) is handled centrally by the Super Administrator.
          </p>
        </div>
      </div>

      {/* Staff KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">My Role</p>
            <p className="text-lg font-extrabold text-slate-800 mt-0.5">{roleName}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Assigned staff entity</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Assigned Branch</p>
            <p className="text-lg font-extrabold text-teal-900 mt-0.5 truncate max-w-[150px]">{branchName}</p>
            <span className="text-[10px] text-teal-600 font-medium">Active branch desk</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account Status</p>
            <p className="text-lg font-extrabold text-slate-800 mt-0.5">{user?.status || 'ACTIVE'}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for counseling</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Staff Profile Overview */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Staff Profile & Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Staff Name</span>
            <p className="font-bold text-slate-800 mt-0.5">{user?.name || 'Staff Member'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Staff Email</span>
            <p className="font-bold text-slate-800 mt-0.5">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <NavLink
            to="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <span>View Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
