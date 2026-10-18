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
  UserCheck,
  Calendar,
  RefreshCw,
  ChevronRight,
  Filter,
  ArrowRight,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { COLORS } from '../../constants/colors';
import useNotifications from '../../hooks/Notifications/useNotifications';

const TYPE_CONFIG = {
  NEW_LEAD: {
    icon: TrendingUp,
    color: '#2563EB',
    bg: '#EFF6FF',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    label: 'New Lead',
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    color: '#059669',
    bg: '#ECFDF5',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    label: 'New Message',
  },
  STAFF_ASSIGNMENT: {
    icon: UserCheck,
    color: '#D97706',
    bg: '#FFFBEB',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    label: 'Assignment',
  },
  CALENDAR_EVENT: {
    icon: Calendar,
    color: '#7C3AED',
    bg: '#F5F3FF',
    badgeBg: '#EDE9FE',
    badgeText: '#5B21B6',
    label: 'Calendar Event',
  },
  STATUS_CHANGE: {
    icon: RefreshCw,
    color: '#DC2626',
    bg: '#FEF2F2',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    label: 'Status Change',
  },
};

const getTypeMeta = (type) =>
  TYPE_CONFIG[type] || {
    icon: Bell,
    color: COLORS.primary,
    bg: COLORS.primaryLight,
    badgeBg: COLORS.primaryLight,
    badgeText: COLORS.primary,
    label: type || 'Alert',
  };

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const TYPE_FILTERS = [
  { key: 'ALL', label: 'All Types' },
  { key: 'NEW_LEAD', label: 'Leads' },
  { key: 'NEW_MESSAGE', label: 'Messages' },
  { key: 'STAFF_ASSIGNMENT', label: 'Assignments' },
  { key: 'CALENDAR_EVENT', label: 'Calendar' },
  { key: 'STATUS_CHANGE', label: 'Status Updates' },
];

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
    year: 'numeric',
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
    }
  };

  const handleQuickMarkRead = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Top Banner Header */}
      <div
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
        className="rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              backgroundColor: COLORS.primaryLight,
              color: COLORS.primary,
            }}
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-blue-100"
          >
            <Bell className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Activity & Notifications
              </h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: COLORS.secondary,
                  }}
                  className="px-2 py-0.5 text-[10px] font-extrabold text-white rounded-full leading-none"
                >
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time activity feed for leads, client messages, team assignments, and calendar events.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              backgroundColor: COLORS.primaryLight,
              borderColor: COLORS.primaryBorder,
              color: COLORS.primary,
            }}
            className="w-full sm:w-auto px-4 py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <CheckCheck className="w-4 h-4 text-[#DC2626]" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
        className="rounded-2xl border p-3 sm:p-4 shadow-sm space-y-3"
      >
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeStatus === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Type
            </span>
          </div>
        </div>

        {/* Type Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_FILTERS.map((typeFilter) => {
            const isSelected = activeType === typeFilter.key;
            return (
              <button
                key={typeFilter.key}
                type="button"
                onClick={() => setActiveType(typeFilter.key)}
                style={{
                  backgroundColor: isSelected ? COLORS.primary : COLORS.background,
                  color: isSelected ? '#ffffff' : COLORS.muted,
                  borderColor: isSelected ? COLORS.primary : COLORS.border,
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected ? 'shadow-xs font-bold' : 'hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {typeFilter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Feed */}
      <div
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
        className="rounded-2xl border shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#1E3A8A]" />
            <p className="text-xs font-semibold">Fetching your notifications...</p>
          </div>
        ) : error ? (
          <div className="py-14 px-6 text-center">
            <p className="text-xs text-red-600 font-semibold mb-2">{error}</p>
            <button
              type="button"
              onClick={loadFiltered}
              className="px-4 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              style={{ backgroundColor: COLORS.background }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border border-slate-100"
            >
              <BellOff className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {activeStatus === 'unread'
                ? 'You are all caught up! No unread notifications.'
                : 'No notification records match your active filter selection.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const meta = getTypeMeta(notif.type);
              const Icon = meta.icon;
              const payload = notif.payload || {};

              return (
                <div
                  key={notif.notification_id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative p-4 sm:p-5 flex items-start gap-3.5 transition-all cursor-pointer ${
                    notif.is_read
                      ? 'hover:bg-slate-50/80'
                      : 'bg-blue-50/30 hover:bg-blue-50/60 border-l-4 border-l-[#2563EB]'
                  }`}
                >
                  {/* Icon Avatar */}
                  <div
                    style={{
                      backgroundColor: meta.bg,
                      color: meta.color,
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>

                  {/* Body Details */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        style={{
                          backgroundColor: meta.badgeBg,
                          color: meta.badgeText,
                        }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide"
                      >
                        {meta.label}
                      </span>

                      {/* Message Channel Tag */}
                      {payload.channel && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {payload.channel}
                        </span>
                      )}

                      {/* Calendar Action Tag */}
                      {payload.action && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold tracking-wider">
                          {payload.action}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm leading-snug ${
                        notif.is_read ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'
                      }`}
                    >
                      {notif.title}
                    </h4>

                    {/* Rich Payload Context Preview */}
                    {notif.type === 'CALENDAR_EVENT' && payload.event_date && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-purple-700 bg-purple-50/60 px-2.5 py-1.5 rounded-lg border border-purple-100 max-w-fit">
                        <span className="flex items-center gap-1 font-semibold">
                          <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                          {payload.event_date}
                        </span>
                        {payload.start_time && (
                          <span className="text-purple-600 font-medium">
                            {formatTimeOnly(payload.start_time)}
                            {payload.end_time ? ` - ${formatTimeOnly(payload.end_time)}` : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {notif.type === 'NEW_MESSAGE' && payload.message_type && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        Type: <span className="font-semibold capitalize">{payload.message_type}</span>
                        {payload.conversation_id ? ` • Conv #${payload.conversation_id}` : ''}
                      </div>
                    )}

                    {notif.type === 'NEW_LEAD' && payload.opportunity_id && (
                      <div className="mt-1 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                        <span>Opportunity #{payload.opportunity_id}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Right Action Area */}
                  <div className="shrink-0 flex items-center gap-2 self-center">
                    {!notif.is_read ? (
                      <button
                        type="button"
                        onClick={(e) => handleQuickMarkRead(e, notif.notification_id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 hidden sm:inline-block">Read</span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Pagination */}
        {!loading && nextCursor && (
          <div
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
            }}
            className="p-4 border-t text-center"
          >
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => fetchMore()}
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
                color: COLORS.primary,
              }}
              className="w-full sm:w-auto px-6 py-2.5 border rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E3A8A]" />
                  <span>Loading older notifications...</span>
                </>
              ) : (
                <>
                  <span>Load more notifications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
