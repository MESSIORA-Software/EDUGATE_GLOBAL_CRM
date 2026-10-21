import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { fetchRoles } from '../../actions/Admin/roleActions';
import { fetchBranches } from '../../actions/Admin/branchAction';
import { fetchUsers } from '../../actions/Admin/userActions';
import {
  RefreshCw,
  Shield,
  Building2,
  Users,
  Kanban,
  HardDrive,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.roles ?? {});
  const { list: branches } = useSelector((state) => state.branch ?? {});
  const { users } = useSelector((state) => state.users ?? {});

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchBranches());
    dispatch(fetchUsers());
  }, [dispatch]);

  const totalRoles = roles?.length || 0;
  const totalBranches = branches?.length || 0;
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.status === 'ACTIVE').length || 0;

  const quickLinks = [
    {
      title: 'System Roles Management',
      desc: 'Define permissions, user role IDs & access tier governance.',
      path: '/roles',
      icon: Shield,
      count: totalRoles,
      badge: 'Roles',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      title: 'Branch Locations',
      desc: 'Manage global offices, regional desks & telephone routing.',
      path: '/branches',
      icon: Building2,
      count: totalBranches,
      badge: 'Branches',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      title: 'User Accounts',
      desc: 'Provision staff, assign branch locations & update credentials.',
      path: '/users',
      icon: Users,
      count: totalUsers,
      badge: 'Users',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      title: 'Student Pipeline',
      desc: 'Interactive Kanban board tracking applications & leads.',
      path: '/pipeline',
      icon: Kanban,
      badge: 'Pipeline',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      title: 'Conversations & Inquiries',
      desc: 'Live multi-channel communication hub & instant responses.',
      path: '/conversations',
      icon: MessageSquare,
      badge: 'Messages',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    },
    {
      title: 'Media Storage Cloud',
      desc: 'Google Cloud powered media asset library & document vault.',
      path: '/media',
      icon: HardDrive,
      badge: 'Storage',
      color: 'bg-rose-50 border-rose-200 text-rose-700',
    },
  ];

  return (
    <div className="space-y-5 max-w-full mx-auto">
            {/* Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Global executive control center for platform statistics, branches, and system metrics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={() => {
              dispatch(fetchRoles());
              dispatch(fetchBranches());
              dispatch(fetchUsers());
            }}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 hover:text-blue-600" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">System Roles</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{totalRoles}</p>
            <span className="text-[10px] text-blue-600 font-medium">Configured entity roles</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Branch Locations</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{totalBranches}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Active operational branches</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">System Users</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{totalUsers}</p>
            <span className="text-[10px] text-indigo-600 font-medium">{activeUsers} Active user accounts</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Platform Security</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">Protected</p>
            <span className="text-[10px] text-slate-500 font-medium">Full RBAC Enforcement</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Governance & Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Super Admin Quick Access Modules</h2>
            <p className="text-xs text-slate-500">Instant access to administrative controllers and configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.title}
                to={item.path}
                className="group p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {item.count !== undefined ? (
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                        {item.count} {item.badge}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                        Access &rarr;
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#1E3A8A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Management View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
