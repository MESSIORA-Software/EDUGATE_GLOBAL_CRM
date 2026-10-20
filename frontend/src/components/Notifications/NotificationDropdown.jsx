import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Loader2,
  ChevronRight,
  CheckCheck,
  Check,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { COLORS } from '../../constants/colors';

const TYPE_CONFIG = {
  NEW_LEAD: {
    icon: TrendingUp,
    color: '#2563EB',
    bg: '#EFF6FF',
    label: 'Lead',
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    color: '#059669',
    bg: '#ECFDF5',
    label: 'Message',
  },
  STAFF_ASSIGNMENT: {
    icon: UserCheck,
    color: '#D97706',
    bg: '#FFFBEB',
    label: 'Assignment',
  },
  CALENDAR_EVENT: {
    icon: Calendar,
    color: '#7C3AED',
    bg: '#F5F3FF',
    label: 'Calendar',
  },
  STATUS_CHANGE: {
    icon: RefreshCw,
    color: '#DC2626',
    bg: '#FEF2F2',
    label: 'Status',
  },
};

const getTypeMeta = (type) =>
  TYPE_CONFIG[type] || {
    icon: Bell,
    color: COLORS.primary,
    bg: COLORS.primaryLight,
    label: type || 'Alert',
  };

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export default function NotificationDropdown({
  isOpen,
  onOpen,
  onClose,
  unreadCount = 0,
  notifications = [],
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notif) => {
    if (!notif.is_read && onMarkAsRead) {
      onMarkAsRead(notif.notification_id);
    }
    onClose();

    const { entity_type, payload, entity_id, type } = notif;
    if (entity_type === 'conversation' || entity_type === 'message' || type === 'NEW_MESSAGE') {
      const targetId = payload?.conversation_id || entity_id;
      navigate(targetId ? `/conversations/${targetId}` : '/clients');
    } else if (entity_type === 'calendar_event' || type === 'CALENDAR_EVENT') {
      navigate('/events');
    } else if (
      entity_type === 'lead' ||
      entity_type === 'opportunity' ||
      type === 'NEW_LEAD' ||
      type === 'STATUS_CHANGE'
    ) {
      navigate('/clients');
    } else {
      navigate('/notifications');
    }
  };

  const previewItems = notifications.slice(0, 6);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={isOpen ? onClose : onOpen}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        style={{
          backgroundColor: isOpen ? COLORS.primaryLight : 'transparent',
          color: isOpen ? COLORS.accent : COLORS.muted,
        }}
        className="relative p-2 rounded-xl transition-all duration-150 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
      >
        <Bell className="w-4 h-4" strokeWidth={2.2} />

        {unreadCount > 0 && (
          <span
            style={{
              backgroundColor: COLORS.secondary,
              boxShadow: '0 0 0 2px #fff',
            }}
            className="absolute top-1 right-1 min-w-[15px] h-[15px] text-[9px] font-extrabold text-white rounded-full flex items-center justify-center px-1 animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
            className="px-4 py-3 border-b flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                    borderColor: COLORS.primaryBorder,
                  }}
                  className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border"
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                style={{ color: COLORS.accent }}
                className="text-[11px] font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E3A8A]" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : previewItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div
                  style={{ backgroundColor: COLORS.background }}
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                >
                  <BellOff className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  We will notify you when new events or messages arrive.
                </p>
              </div>
            ) : (
              previewItems.map((notif) => {
                const meta = getTypeMeta(notif.type);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notif.notification_id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-3 p-3 transition-colors cursor-pointer ${
                      notif.is_read
                        ? 'hover:bg-slate-50'
                        : 'bg-blue-50/40 hover:bg-blue-50/70'
                    }`}
                  >
                    {/* Type Icon Badge */}
                    <div
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.color,
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          style={{ color: meta.color }}
                          className="text-[9px] font-extrabold uppercase tracking-wide"
                        >
                          {meta.label}
                        </span>
                        {notif.payload?.channel && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold uppercase">
                            {notif.payload.channel}
                          </span>
                        )}
                        {notif.payload?.action && (
                          <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded text-[9px] font-bold">
                            {notif.payload.action}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs mt-0.5 line-clamp-2 ${
                          notif.is_read ? 'text-slate-600 font-normal' : 'text-slate-900 font-semibold'
                        }`}
                      >
                        {notif.title}
                      </p>

                      <span className="text-[10px] text-slate-400 block mt-1">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    {/* Unread Indicator & Mark Single Button */}
                    <div className="shrink-0 flex items-center mt-1">
                      {!notif.is_read ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onMarkAsRead) onMarkAsRead(notif.notification_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-600 transition-opacity"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1 group-hover:hidden" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - View All */}
          <div
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
            }}
            className="p-2 border-t text-center"
          >
            <button
              type="button"
              id="view-all-notifications-btn"
              onClick={() => {
                onClose();
                navigate('/notifications');
              }}
              style={{ color: COLORS.accent }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
