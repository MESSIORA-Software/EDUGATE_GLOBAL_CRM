import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { fetchRoles } from '../../actions/Admin/roleActions';
import { fetchBranches } from '../../actions/Admin/branchAction';
import { fetchUsers } from '../../actions/Admin/userActions';
import { fetchClients } from '../../actions/Admin/clientAction';
import { fetchEvents } from '../../actions/Admin/eventAction';
import {
  RefreshCw,
  Shield,
  Building2,
  Users,
  Kanban,
  HardDrive,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  Calendar,
  Clock,
  User,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.roles ?? {});
  const { list: branches } = useSelector((state) => state.branch ?? {});
  const { users } = useSelector((state) => state.users ?? {});
  const { list: clients } = useSelector((state) => state.client ?? {});
  const { list: events } = useSelector((state) => state.event ?? {});

  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllMetrics = () => {
    setRefreshing(true);
    dispatch(fetchRoles());
    dispatch(fetchBranches());
    dispatch(fetchUsers());
    dispatch(fetchClients());
    dispatch(fetchEvents());
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    loadAllMetrics();
  }, [dispatch]);

  // Rotate events automatically every 5 seconds
  useEffect(() => {
    if (!events || events.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events, isPaused]);

  const totalStudents = clients?.length || 0;
  const totalBranches = branches?.length || 0;
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.status === 'ACTIVE').length || 0;
  const totalEvents = events?.length || 0;
  const totalRoles = roles?.length || 0;

  const activeEvent =
    events && events.length > 0
      ? events[currentEventIdx % events.length]
      : null;

  const getEventStaffName = (ev) => {
    if (!ev) return 'Staff Counselor';
    if (ev.assigned_staff?.name) return ev.assigned_staff.name;
    if (ev.assigned_staff?.email) return ev.assigned_staff.email;
    if (ev.assigned_staff_id && users) {
      const u = users.find(
        (usr) => String(usr.user_id || usr.id) === String(ev.assigned_staff_id)
      );
      if (u?.name) return u.name;
      if (u?.email) return u.email;
    }
    return ev.staff_name || 'Staff Counselor';
  };

  const formatEventDate = (ev) => {
    if (!ev?.event_date) return 'Upcoming';
    try {
      const parts = String(ev.event_date).split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return ev.event_date;
    } catch {
      return ev.event_date;
    }
  };

  const quickLinks = [
    {
      title: 'Students & Clients',
      desc: 'Candidate profiles, admissions records & document status.',
      path: '/students',
      icon: GraduationCap,
      count: totalStudents,
      badge: 'Students',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      title: 'Events & Scheduling',
      desc: 'Meetings, student consultations & calendar schedules.',
      path: '/events',
      icon: Calendar,
      count: totalEvents,
      badge: 'Events',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
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
      title: 'Branch Locations',
      desc: 'Manage global offices, regional desks & telephone routing.',
      path: '/branches',
      icon: Building2,
      count: totalBranches,
      badge: 'Branches',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      title: 'Student Pipeline',
      desc: 'Interactive Kanban board tracking applications & leads.',
      path: '/pipeline',
      icon: Kanban,
      badge: 'Pipeline',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
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
    {
      title: 'System Roles Management',
      desc: 'Define permissions, user role IDs & access tier governance.',
      path: '/roles',
      icon: Shield,
      count: totalRoles,
      badge: 'Roles',
      color: 'bg-slate-50 border-slate-200 text-slate-700',
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
            onClick={loadAllMetrics}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Metrics"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-600 hover:text-blue-600 ${
                refreshing ? 'animate-spin text-blue-600' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Students (Replaced System Roles) */}
        <NavLink
          to="/students"
          className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
              {totalStudents}
            </p>
            <span className="text-[10px] text-blue-600 font-medium">
              Enrolled candidates & clients
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
        </NavLink>

        {/* Card 2: Branch Locations */}
        <NavLink
          to="/branches"
          className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Branch Locations
            </p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
              {totalBranches}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              Active operational branches
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
        </NavLink>

        {/* Card 3: System Users */}
        <NavLink
          to="/users"
          className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              System Users
            </p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
              {totalUsers}
            </p>
            <span className="text-[10px] text-indigo-600 font-medium">
              {activeUsers} Active user accounts
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </NavLink>

        {/* Card 4: Live Upcoming Events (Replaced Platform Security, Rotates every 5s) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all flex flex-col justify-between group min-h-[96px]"
        >
          {/* Header Row: Live Pulse + Event Counter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Upcoming Events
              </p>
            </div>
            {totalEvents > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                {(currentEventIdx % totalEvents) + 1}/{totalEvents}
              </span>
            )}
          </div>

          {/* Body Row: Rotating Event Detail */}
          {activeEvent ? (
            <NavLink
              to="/events"
              key={activeEvent.event_id || currentEventIdx}
              className="mt-1 block min-w-0 animate-in fade-in slide-in-from-right-1 duration-300"
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors"
                  title={activeEvent.title}
                >
                  {activeEvent.title || 'Scheduled Meeting'}
                </p>
                <span className="text-[10px] text-blue-600 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] mt-0.5">
                <span className="inline-flex items-center gap-1 text-slate-600 font-medium truncate max-w-[120px]">
                  <User className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">{getEventStaffName(activeEvent)}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>
                    {formatEventDate(activeEvent)}
                    {activeEvent.start_time
                      ? ` • ${activeEvent.start_time.slice(0, 5)}`
                      : ''}
                  </span>
                </span>
              </div>
            </NavLink>
          ) : (
            <NavLink
              to="/events"
              className="flex items-center justify-between mt-1 text-slate-400 group-hover:text-blue-600"
            >
              <div>
                <p className="text-xs font-bold text-slate-700">No Events Scheduled</p>
                <span className="text-[10px] text-slate-400 font-medium">Click to schedule event</span>
              </div>
              <Calendar className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </NavLink>
          )}
        </div>
      </div>

      {/* Main Governance & Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
              Super Admin Quick Access Modules
            </h2>
            <p className="text-xs text-slate-500">
              Instant access to administrative controllers and configurations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}
                    >
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
