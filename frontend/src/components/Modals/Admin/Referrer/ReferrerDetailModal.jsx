import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import {
  X,
  UserCheck,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Award,
} from 'lucide-react';

export default function ReferrerDetailModal({ isOpen, referrer, onClose, onEdit }) {
  if (!isOpen || !referrer) return null;

  return (
    <div className="fixed inset-0 lg:left-60 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all duration-300 animate-in fade-in">
      <div className="rounded-2xl shadow-2xl border border-slate-200/90 bg-white max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all duration-300 ease-out animate-in zoom-in-95">
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs transition-transform duration-200 hover:scale-105"
            >
              <Award className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={TYPOGRAPHY.heading}>{referrer.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {referrer.status || 'Active'}
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-blue-700">{referrer.referrer_code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Official Clean Referrer ID Bar */}
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between transition-all duration-200">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Referrer ID
            </span>
            <span className="font-mono text-xs font-bold text-blue-900 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs tracking-wider">
              {referrer.referrer_code}
            </span>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
              </span>
              <p className="font-medium text-slate-800 truncate">
                {referrer.email || <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
              </span>
              <p className="font-medium text-slate-800 truncate">
                {referrer.phone_number || <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number
              </span>
              <p className="font-medium text-slate-800 truncate">
                {referrer.whatsapp_number || <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Registered Date
              </span>
              <p className="font-medium text-slate-800">
                {referrer.created_at
                  ? new Date(referrer.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Home Address */}
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Home Address
            </span>
            <p className="font-medium text-slate-800">
              {referrer.home_address || <span className="text-slate-400 italic">Not provided</span>}
            </p>
          </div>

          {/* Note */}
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> Notes & Agreements
            </span>
            <p className="font-medium text-slate-800 whitespace-pre-wrap">
              {referrer.note || <span className="text-slate-400 italic">No notes recorded</span>}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(referrer);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Edit Referrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
