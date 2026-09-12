import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { X, User, Mail, Calendar, Share2, Hash, CheckCircle2 } from 'lucide-react';

export default function ClientDetailModal({ isOpen, client, onClose }) {
  if (!isOpen || !client) return null;

  const clientId   = client.client_id || client.id || 'N/A';
  const clientName = client.name || 'Unnamed Client';
  const email      = client.email || 'No email provided';
  const dob        = client.dob || 'Not specified';
  const source     = client.source || 'General Contact';
  const createdAt  = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-4 border-b"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0"
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>{clientName}</h3>
              <p className={TYPOGRAPHY.caption}>Client Profile & Contact Info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Cards */}
        <div className="p-5 space-y-3.5">
          <div
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
            className="border rounded-2xl p-4 space-y-3 shadow-2xs"
          >
            {/* Header ID & Status */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Client Identifier</span>
              </div>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border"
              >
                #{clientId}
              </span>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{email}</span>
              </div>
            </div>

            {/* DOB & Source Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Date of Birth
                </span>
                <p className="text-xs font-bold text-slate-700">{dob}</p>
              </div>

              <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-emerald-500" /> Lead Source
                </span>
                <p className="text-xs font-bold text-emerald-800">{source}</p>
              </div>
            </div>

            {/* Footer Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                {createdAt && <span>Registered {createdAt}</span>}
              </div>
              <Badge variant="green" icon={CheckCircle2}>
                Registered Client
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}
          className="flex items-center justify-end px-5 py-3 border-t"
        >
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
