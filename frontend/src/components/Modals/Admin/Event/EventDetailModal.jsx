import React from 'react';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, User, UserCheck, Edit2 } from 'lucide-react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';

export default function EventDetailModal({ isOpen, event, onClose, onEdit }) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className={TYPOGRAPHY.h3} style={{ color: COLORS.foreground }}>
                Event Details
              </h2>
              <p className={TYPOGRAPHY.label} style={{ color: COLORS.muted }}>
                Event #{event.event_id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: COLORS.muted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{event.title}</h3>
            <div className="flex items-start gap-2 text-xs text-slate-600 mt-2">
              <AlignLeft className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{event.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                {event.event_date}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                {event.start_time ? event.start_time.substring(0,5) : '--'} - {event.end_time ? event.end_time.substring(0,5) : '--'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Staff</p>
              {event.assigned_staff ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  {event.assigned_staff.name || event.assigned_staff.email}
                  <span className="text-[10px] text-slate-400">({event.assigned_staff_id})</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No staff assigned</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Linked Client</p>
              {event.client ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {event.client.name || event.client.email}
                  <span className="text-[10px] text-slate-400">({event.client_id})</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No client linked</p>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex flex-col gap-1 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span>Created: {new Date(event.created_at).toLocaleString()}</span>
              {event.creator && <span>By: {event.creator.name}</span>}
            </div>
            {event.updater && event.updated_at && (
              <div className="flex justify-between">
                <span>Updated: {new Date(event.updated_at).toLocaleString()}</span>
                <span>By: {event.updater.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t flex justify-between items-center" style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            icon={Edit2}
            onClick={() => {
              onClose();
              if (onEdit) onEdit(event);
            }}
          >
            Edit Event
          </Button>
        </div>
      </div>
    </div>
  );
}
