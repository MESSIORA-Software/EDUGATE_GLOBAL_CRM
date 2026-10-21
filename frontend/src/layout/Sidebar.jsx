import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import { getUserRole } from '../utils/roleUtils';
import { COLORS } from '../constants/colors';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { useSelector } from 'react-redux';
import {
  Shield,
  Building2,
  Users,
  UserCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  HardDrive,
  Kanban,
  MessageSquare,
  Calendar,
  Bell,
  Award,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, handleLogout } = useAuth();
  const unreadCount = useSelector((state) => state.notifications?.unreadCount ?? 0);
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMIN';

  const formatRoleLabel = (role) => {
    if (!role) return 'Staff';
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Branch Admin';
    if (role === 'STAFF') return 'Staff Member';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const navItems = isSuperAdmin
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'System Roles', path: '/roles', icon: Shield },
        { name: 'Branch Locations', path: '/branches', icon: Building2 },
        { name: 'User Accounts', path: '/users', icon: Users },
        { name: 'Students / Clients', path: '/clients', icon: UserCheck },
        { name: 'Student Pipeline', path: '/pipeline', icon: Kanban },
        { name: 'Referrers', path: '/referrers', icon: Award },
        { name: 'Conversations', path: '/conversations', icon: MessageSquare },
        { name: 'Media Storage', path: '/media', icon: HardDrive },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'My Profile', path: '/profile', icon: UserCheck },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    : isAdmin
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Students / Clients', path: '/clients', icon: UserCheck },
        { name: 'Student Pipeline', path: '/pipeline', icon: Kanban },
        { name: 'Referrers', path: '/referrers', icon: Award },
        { name: 'Conversations', path: '/conversations', icon: MessageSquare },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'My Profile', path: '/profile', icon: UserCheck },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Students / Clients', path: '/clients', icon: UserCheck },
        { name: 'Student Pipeline', path: '/pipeline', icon: Kanban },
        { name: 'Conversations', path: '/conversations', icon: MessageSquare },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'My Profile', path: '/profile', icon: UserCheck },
      ];


  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.sidebarBorder,
        }}
        className={`fixed top-0 left-0 z-50 h-screen w-60 border-r flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-5 border-b border-slate-200/80 bg-white">
            <NavLink to="/dashboard" className="flex items-center min-w-0" title="EduGate Global">
              <img
                src={edugateLogo}
                alt="EduGate Srilanka"
                className="h-11 w-auto max-w-[175px] object-contain shrink-0"
              />
            </NavLink>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? COLORS.primaryLight : COLORS.transparent,
                    color: isActive ? COLORS.primary : COLORS.muted,
                  })}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-slate-100 ${
                      isActive ? 'border-l-4 border-[#DC2626] font-bold shadow-sm' : ''
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge > 0 && (
                    <span
                      style={{
                        backgroundColor: COLORS.secondary,
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-extrabold text-white rounded-full leading-none shrink-0"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-200/80 space-y-2 bg-white">
          {user && (
            <NavLink
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
              title="Click to view full profile"
            >
              {/* Avatar with gradient & online dot */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400/20" />
              </div>

              {/* User text details */}
              <div className="overflow-hidden text-left flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0 leading-none">
                    {formatRoleLabel(userRole)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1 font-medium leading-tight">
                  {user.email || 'user@edugate.lk'}
                </p>
              </div>
            </NavLink>
          )}

          {/* Logout Button */}
          <button
            onClick={() => handleLogout(onClose)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/80 border border-rose-200/70 hover:bg-rose-100 hover:border-rose-300 transition-all active:scale-[0.99] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
