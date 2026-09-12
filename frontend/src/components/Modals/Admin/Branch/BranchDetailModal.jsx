import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { X, Building2, MapPin, Phone, CheckCircle2, Users, Calendar, Hash } from 'lucide-react';

export default function BranchDetailModal({ isOpen, branch, onClose, onViewUsers }) {
  if (!isOpen || !branch) return null;

  const branchId = branch.branch_id || branch.id || 'N/A';
  const createdAt = branch.created_at
    ? new Date(branch.created_at).toLocaleDateString('en-US', {
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>{branch.name || 'Branch Details'}</h3>
              <p className={TYPOGRAPHY.caption}>Branch Location & Contact Information</p>
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

        {/* Detail Cards Content */}
        <div className="p-5 space-y-3.5">
          {/* Main Info Card */}
          <div
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
            className="border rounded-2xl p-4 space-y-3 shadow-2xs"
          >
            {/* Branch ID & Status Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Branch ID</span>
              </div>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border"
              >
                #{branchId}
              </span>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Location Address
              </span>
              <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{branch.address || 'No address specified'}</span>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contact Phone
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{branch.phone || 'No phone provided'}</span>
              </div>
            </div>

            {/* Status & Created Date */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                {createdAt && (
                  <>
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Created {createdAt}</span>
                  </>
                )}
              </div>
              <Badge variant="green" icon={CheckCircle2}>
                Active Branch
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}
          className="flex items-center justify-between px-5 py-3 border-t"
        >
          {onViewUsers && (
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={() => {
                onClose();
                onViewUsers(branch);
              }}
            >
              View Branch Users
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
