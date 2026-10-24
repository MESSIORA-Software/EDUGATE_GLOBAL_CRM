import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Loader2,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  UserCheck,
  UserPlus,
  Calendar,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Filter,
  Clock,
  Mail,
  Layers,
} from 'lucide-react';
import useNotifications from '../../hooks/Notifications/useNotifications';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

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

  if (isToday) {
    return timeStr;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }
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

const formatTimeOnly = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

// Clean Professional Notification Titles (NO '#' or raw technical codes)
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

// Genuine Business Context Note (Concise, natural, no AI boilerplate)
const getNotificationContext = (notif) => {
  const { type, payload = {} } = notif;
  const channel = (payload.channel || '').toLowerCase();

  switch (type) {
    case 'NEW_MESSAGE':
      if (channel === 'email') return 'Incoming student email awaiting counselor response';
      if (channel === 'whatsapp') return 'WhatsApp inquiry received from prospective client';
      return 'Client message received in communication queue';

    case 'STATUS_CHANGE':
      if (payload.from_status && payload.to_status) {
        return `Pipeline stage moved from ${payload.from_status} to ${payload.to_status}`;
      }
      return 'Student application stage updated in CRM pipeline';

    case 'NEW_LEAD':
      return 'New prospective student registered for counselor evaluation';

    case 'CALENDAR_EVENT':
      if (payload.event_date) {
        return `Appointment scheduled for ${payload.event_date}${payload.start_time ? ` at ${formatTimeOnly(payload.start_time)}` : ''}`;
      }
      return 'Upcoming meeting or event added to your calendar';

    case 'STAFF_ASSIGNMENT':
      return 'New student profile allocated to your counselor account';

    default:
      return 'Activity update recorded in CRM';
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

// Client-side Date Grouping (Today, Yesterday, Earlier this week, Earlier)
const groupNotificationsByDate = (items) => {
  if (!items || items.length === 0) return [];
  const groups = {
    Today: [],
    Yesterday: [],
    'Earlier this week': [],
    Earlier: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 6 * 86400000;

  items.forEach((notif) => {
    const itemDate = new Date(notif.created_at);
    const itemTime = itemDate.getTime();

    if (itemTime >= startOfToday) {
      groups.Today.push(notif);
    } else if (itemTime >= startOfYesterday) {
      groups.Yesterday.push(notif);
    } else if (itemTime >= startOfWeek) {
      groups['Earlier this week'].push(notif);
    } else {
      groups.Earlier.push(notif);
    }
  });

  const order = ['Today', 'Yesterday', 'Earlier this week', 'Earlier'];
  return order
    .filter((key) => groups[key] && groups[key].length > 0)
    .map((key) => ({ label: key, items: groups[key] }));
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeType, setActiveType] = useState('ALL');

  const {
    notifications,
    nextCursor,
    loading,
    loadingMore,
    unreadCount,
    error,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Load notifications whenever active filter tab or type changes
  const loadFiltered = useCallback(() => {
    const params = { limit: 20 };
    if (activeStatus === 'unread') params.read = false;
    if (activeStatus === 'read') params.read = true;
    if (activeType !== 'ALL') params.type = activeType;
    fetchNotifications(params);
  }, [activeStatus, activeType, fetchNotifications]);

  useEffect(() => {
    loadFiltered();
  }, [loadFiltered]);

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.notification_id);
    }

    const { entity_type, payload = {}, entity_id, type } = notif;
    if (entity_type === 'conversation' || entity_type === 'message' || type === 'NEW_MESSAGE') {
      const targetId = payload.conversation_id || entity_id;
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
    }
  };

  const handleQuickMarkRead = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16 px-2 sm:px-0">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {unreadCount} unread
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                All read
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time updates on client conversations, leads, and calendar appointments.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={loadFiltered}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-slate-500" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Status Segmented Tabs */}
        <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl self-start">
          {STATUS_TABS.map((tab) => {
            const isSelected = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs appearance-none"
            >
              <option value="ALL">All Categories</option>
              <option value="NEW_MESSAGE">Messages</option>
              <option value="NEW_LEAD">Leads</option>
              <option value="CALENDAR_EVENT">Calendar</option>
              <option value="STATUS_CHANGE">Pipeline Updates</option>
              <option value="STAFF_ASSIGNMENT">Assignments</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grouped Enterprise Notification Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            <p className="text-xs font-medium text-slate-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-8 text-center">
            <p className="text-xs text-rose-600 font-medium mb-2">{error}</p>
            <button
              type="button"
              onClick={loadFiltered}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-2.5 border border-slate-200/60">
              <BellOff className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {activeStatus === 'unread'
                ? 'You have zero unread notifications.'
                : 'No notifications match your active filter.'}
            </p>
          </div>
        ) : (
          groupNotificationsByDate(notifications).map((group) => (
            <div key={group.label} className="space-y-2">
              {/* Group Timeline Header */}
              <div className="flex items-center gap-2 px-1 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {group.label}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">
                  {group.items.length}
                </span>
                <div className="flex-1 h-px bg-slate-200/60 ml-2" />
              </div>

              {/* Group Items with clean small gap */}
              <div className="space-y-2">
                {group.items.map((notif) => {
                  const visuals = getNotificationVisuals(notif);
                  const Icon = visuals.icon;
                  const isUnread = !notif.is_read && !notif.read_at;
                  const title = getNotificationTitle(notif);
                  const contextNote = getNotificationContext(notif);

                  return (
                    <div
                      key={notif.notification_id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative px-4 sm:px-5 py-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center gap-3.5 ${
                        isUnread
                          ? 'bg-white border-blue-200 shadow-2xs hover:border-blue-400 hover:shadow-xs ring-1 ring-blue-500/10'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      <div className="shrink-0 flex items-center justify-center w-2">
                        {isUnread ? (
                          <span className="block w-2 h-2 rounded-full bg-blue-600 shadow-2xs" title="Unread" />
                        ) : (
                          <span className="block w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${visuals.iconBg} shadow-2xs transition-transform group-hover:scale-105`}
                      >
                        <Icon className="w-4.5 h-4.5" strokeWidth={2.1} />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-xs sm:text-sm ${
                              isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                            }`}
                          >
                            {title}
                          </p>
                          {visuals.badgeText && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border shrink-0 ${visuals.badgeBg}`}>
                              {visuals.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                          {contextNote}
                        </p>
                      </div>

                      {/* Right Action & Timestamp */}
                      <div className="shrink-0 flex items-center gap-3">
                        <span
                          title={formatFullTooltip(notif.created_at)}
                          className="text-[11px] text-slate-400 whitespace-nowrap font-medium"
                        >
                          {formatNotificationTime(notif.created_at)}
                        </span>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickMarkRead(e, notif.notification_id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More Pagination */}
        {!loading && nextCursor && (
          <div className="p-3 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs mt-3">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => fetchMore()}
              className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load older notifications</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
