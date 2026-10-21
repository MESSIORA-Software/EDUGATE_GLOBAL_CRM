import React, { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import useNotifications from '../hooks/Notifications/useNotifications';
import { COLORS } from '../constants/colors';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Menu, Sparkles, Shield } from 'lucide-react';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import { getRoleDashboardTitle } from '../utils/roleUtils';

const getPageTitle = (pathname) => {
  if (!pathname) return '';

  // Exclude media and events as requested
  if (pathname.startsWith('/media') || pathname.startsWith('/events')) {
    return '';
  }

  if (pathname === '/dashboard' || pathname === '/') {
    return 'Dashboard';
  }
  if (pathname.startsWith('/roles')) {
    return 'System Roles Management';
  }
  if (pathname.startsWith('/branches')) {
    return 'Branch Locations';
  }
  if (pathname.startsWith('/users')) {
    return 'User Accounts';
  }
  if (pathname.startsWith('/clients') || pathname.startsWith('/students')) {
    return 'Students & Clients';
  }
  if (pathname.startsWith('/pipeline') || pathname.startsWith('/student-pipeline')) {
    return 'Student Pipeline';
  }
  if (pathname.startsWith('/conversations')) {
    return 'Conversations';
  }
  if (pathname.startsWith('/profile')) {
    return 'User Profile';
  }
  if (pathname.startsWith('/settings')) {
    return 'Settings';
  }

  return '';
};

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dashboardTitle = getRoleDashboardTitle(user);

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
    <header
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
      className="h-14 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          style={{ color: COLORS.muted }}
          className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {pageTitle && (
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live System Indicator Badge */}
        <div
          style={{
            backgroundColor: COLORS.primaryLight,
            borderColor: COLORS.primaryBorder,
            color: COLORS.primary,
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Edugate Global CRM</span>
        </div>

        {/* Logged User Role Dashboard Badge */}
        {dashboardTitle && (
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderColor: '#BFDBFE',
              color: '#1E3A8A',
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>{dashboardTitle}</span>
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

        <div style={{ backgroundColor: COLORS.border }} className="h-5 w-px mx-0.5" />

        {/* User Profile Quick Link */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          title="View My Profile"
        >
          <div
            style={{
              backgroundColor: COLORS.primaryLight,
              color: COLORS.primary,
              borderColor: COLORS.primaryBorder,
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
        </NavLink>

        {/* Logo Badge */}
        <div className="flex items-center gap-2">
          <img
            src={edugateLogo}
            alt="Edugate Logo"
            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
