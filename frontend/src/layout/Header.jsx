import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/Auth/useAuth';
import useNotifications from '../hooks/Notifications/useNotifications';
import { COLORS } from '../constants/colors';
import edugateLogo from '../assets/edugate_logo.jpeg';
import { Bell, Search, Menu, Sparkles, User, Shield } from 'lucide-react';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import { getRoleDashboardTitle } from '../utils/roleUtils';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
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
import { Bell, Search, Menu, Sparkles, User, Shield } from 'lucide-react';
import { getRoleDashboardTitle } from '../utils/roleUtils';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
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
        {/* Notification bell */}
        <button
          style={{ color: COLORS.muted }}
          className="relative p-1.5 rounded-lg hover:text-[#1E3A8A] hover:bg-slate-100 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span
            style={{ backgroundColor: COLORS.secondary }}
            className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white"
          />
        </button>

        <div style={{ backgroundColor: COLORS.border }} className="h-5 w-px mx-0.5" />

        {/* User Avatar */}
        <NavLink to="/profile" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer" title="View My Profile">
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

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={edugateLogo} alt="Edugate Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm" />
        </div>
      </div>
    </header>
  );
}
