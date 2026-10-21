import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import useNotifications from '../hooks/Notifications/useNotifications';
import { COLORS } from '../constants/colors';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Menu, Shield, ChevronDown } from 'lucide-react';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import { getRoleDashboardTitle, getUserRole } from '../utils/roleUtils';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dashboardTitle = getRoleDashboardTitle(user);
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleOpen = useCallback(() => {
    setIsNotifOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClose = useCallback(() => setIsNotifOpen(false), []);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand logo (visible only when sidebar is hidden) */}
        <NavLink to="/dashboard" className="flex items-center gap-2 lg:hidden shrink-0">
          <img
            src={edugateLogo}
            alt="EduGate Global"
            className="h-8 w-auto object-contain"
          />
        </NavLink>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Clean Role Scope Badge */}
        {dashboardTitle && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200/80 bg-blue-50/70 text-blue-800 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{isSuperAdmin ? 'Super Admin' : userRole === 'ADMIN' ? 'Branch Admin' : 'Staff Workspace'}</span>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <NotificationDropdown
          isOpen={isNotifOpen}
          onOpen={handleOpen}
          onClose={handleClose}
          unreadCount={unreadCount}
          notifications={notifications}
          loading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* User Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all shadow-2xs group cursor-pointer"
          title="View My Profile & Settings"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              {userRole?.replace('_', ' ') || 'Staff'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition hidden sm:block shrink-0" />
        </NavLink>
      </div>
    </header>
  );
}
