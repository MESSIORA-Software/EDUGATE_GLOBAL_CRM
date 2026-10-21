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
  MessageCircle,
  UserCheck,
  UserPlus,
  Calendar,
  Mail,
} from 'lucide-react';
import { COLORS } from '../../constants/colors';

const formatNotificationTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString() ===
    date.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatFullTooltip = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Clean Professional Notification Titles (NO '#' or raw codes)
const getNotificationTitle = (notif) => {
  const { type, payload = {} } = notif;
  const channel = (payload.channel || '').toLowerCase();

  switch (type) {
    case 'NEW_MESSAGE':
      if (channel === 'email') return 'New Email Message';
      if (channel === 'whatsapp') return 'New WhatsApp Message';
      return 'New Client Message';

    case 'STATUS_CHANGE':
      return 'Opportunity Status Updated';

    case 'NEW_LEAD':
      return 'New Student Lead Inquiry';

    case 'CALENDAR_EVENT':
      return 'Calendar Meeting Scheduled';

    case 'STAFF_ASSIGNMENT':
      return 'New Staff Assignment';

    default: {
      const raw = notif.title || 'System Notification';
      return raw.replace(/#/g, '').trim();
    }
  }
};

// Accurate contextual icons & colors
const getNotificationVisuals = (notif) => {
  const { type, payload = {} } = notif;
  const channel = (payload.channel || '').toLowerCase();

  switch (type) {
    case 'NEW_MESSAGE':
      if (channel === 'email') {
        return {
          icon: Mail,
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200/70',
          badgeText: 'Email',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
        };
      }
      if (channel === 'whatsapp') {
        return {
          icon: MessageCircle,
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
          badgeText: 'WhatsApp',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        };
      }
      return {
        icon: MessageSquare,
        iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/70',
        badgeText: 'Message',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      };

    case 'NEW_LEAD':
      return {
        icon: UserPlus,
        iconBg: 'bg-teal-50 text-teal-600 border-teal-200/70',
        badgeText: 'Lead',
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/60',
      };

    case 'CALENDAR_EVENT':
      return {
        icon: Calendar,
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200/70',
        badgeText: 'Calendar',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
      };

    case 'STATUS_CHANGE':
      return {
        icon: TrendingUp,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200/70',
        badgeText: 'Pipeline',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      };

    case 'STAFF_ASSIGNMENT':
      return {
        icon: UserCheck,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200/70',
        badgeText: 'Assignment',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      };

    default:
      return {
        icon: Bell,
        iconBg: 'bg-slate-100 text-slate-600 border-slate-200/70',
        badgeText: 'Alert',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200/60',
      };
  }
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
          className="absolute right-0 top-full mt-2 w-84 sm:w-92 rounded-2xl border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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
              <span className="font-bold text-xs text-slate-900">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  All read
                </span>
              )}
            </div>

            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
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
                  We will notify you when new messages or events arrive.
                </p>
              </div>
            ) : (
              previewItems.map((notif) => {
                const visuals = getNotificationVisuals(notif);
                const IconComponent = visuals.icon;
                const isUnread = !notif.is_read;
                const title = getNotificationTitle(notif);

                return (
                  <div
                    key={notif.notification_id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-center gap-3 px-3.5 py-3 transition-colors cursor-pointer ${
                      isUnread
                        ? 'bg-blue-50/20 hover:bg-blue-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    <div className="shrink-0 flex items-center justify-center w-1.5">
                      {isUnread ? (
                        <span className="block w-1.5 h-1.5 rounded-full bg-blue-600" title="Unread" />
                      ) : (
                        <span className="block w-1.5 h-1.5 rounded-full bg-transparent" />
                      )}
                    </div>

                    {/* Specific Contextual Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${visuals.iconBg} shadow-2xs`}
                    >
                      <IconComponent className="w-4 h-4" strokeWidth={2} />
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p
                          className={`text-xs truncate ${
                            isUnread ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'
                          }`}
                        >
                          {title}
                        </p>
                        {visuals.badgeText && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wide border shrink-0 ${visuals.badgeBg}`}
                          >
                            {visuals.badgeText}
                          </span>
                        )}
                      </div>

                      <span
                        title={formatFullTooltip(notif.created_at)}
                        className="text-[10px] text-slate-400 block mt-0.5 font-medium cursor-help"
                      >
                        {formatNotificationTime(notif.created_at)}
                      </span>
                    </div>

                    {/* Quick Mark Read Button & Chevron */}
                    <div className="shrink-0 flex items-center gap-0.5">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onMarkAsRead) onMarkAsRead(notif.notification_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-600 transition-opacity cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
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
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
