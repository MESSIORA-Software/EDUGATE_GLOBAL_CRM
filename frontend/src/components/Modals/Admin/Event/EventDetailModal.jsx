import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, User, UserCheck, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { formatEventId } from '../../../../hooks/Admin/Event/useEvent';

export default function EventDetailModal({ isOpen, event, onClose, onEdit, onDelete }) {
  const users = useSelector((state) => state.users?.users || []);
  const clients = useSelector((state) => state.client?.list || []);

  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !event) return null;

  const eventId = event.event_id || event.id;
  const formattedId = formatEventId(eventId);
  const matchedStaff = users.find((u) => String(u.user_id || u.id) === String(event.assigned_staff_id));
  const staffDisplayName =
    event.assigned_staff?.name ||
    event.assigned_staff?.email ||
    matchedStaff?.name ||
    matchedStaff?.email ||
    (event.assigned_staff_id ? `Staff #${event.assigned_staff_id}` : null);
  const staffEmail = event.assigned_staff?.email || matchedStaff?.email || null;

  const matchedClient = clients.find((c) => String(c.client_id || c.id) === String(event.client_id));
  const clientDisplayName =
    event.client?.name ||
    event.client?.email ||
    matchedClient?.name ||
    (event.client_id ? `Client #${event.client_id}` : null);
  const clientEmail = event.client?.email || matchedClient?.email || null;

  const handleCopyId = () => {
    if (!formattedId) return;
    navigator.clipboard?.writeText(formattedId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const eventTime =
    event.start_time || event.end_time
      ? `${event.start_time?.slice(0, 5) || '--'} to ${event.end_time?.slice(0, 5) || '--'}`
      : 'All Day / Time not set';

  const createdAt = event.created_at
    ? new Date(event.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-sm sm:max-w-md">
                  {event.title}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                  title="Click to copy Event ID"
                >
                  <span>{formattedId}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-500" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Scheduled meeting and calendar event details
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
            {/* Event Schedule & Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Schedule Overview
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Clock className="w-3 h-3" />
                  <span>{eventTime}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Event Date
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span>{event.event_date}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Time Window
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{eventTime}</span>
                  </div>
                </div>
              </div>

              {/* Purpose / Reason Description */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Reason & Purpose Details
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {event.reason || 'No description provided.'}
                </div>
              </div>
            </div>

            {/* Participants & Assignment Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Event Participants
                </span>
              </div>

              {/* Assigned Staff */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                  {staffDisplayName ? staffDisplayName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Staff
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {staffDisplayName || 'Unassigned Staff Member'}
                  </p>
                  {staffEmail && (
                    <p className="text-[11px] text-slate-500 truncate">{staffEmail}</p>
                  )}
                </div>
              </div>

              {/* Associated Client / Student */}
              {clientDisplayName && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                    {clientDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Associated Client
                    </span>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {clientDisplayName}
                    </p>
                    {clientEmail && (
                      <p className="text-[11px] text-slate-500 truncate">{clientEmail}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {createdAt && (
                <div className="pt-2 text-[11px] text-slate-400">
                  Event created on: {createdAt}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete?.(event);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Event</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit?.(event);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
