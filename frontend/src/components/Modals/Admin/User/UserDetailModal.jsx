import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { X, UserCheck, Mail, Building2, ShieldCheck, CheckCircle2, Hash, Calendar } from 'lucide-react';

export default function UserDetailModal({ isOpen, user, onClose }) {
  if (!isOpen || !user) return null;

  const userId = user.user_id || user.id || 'N/A';
  const userName = user.name || 'Unnamed User';
  const userEmail = user.email || 'No email provided';
  const branchId = user.branch_id || 1;
  const roleId = user.role_id || 1;
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
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
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>{userName}</h3>
              <p className={TYPOGRAPHY.caption}>User Account Profile & Assignment</p>
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
          <div
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
            className="border rounded-2xl p-4 space-y-3 shadow-2xs"
          >
            {/* User ID Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>User Identifier</span>
              </div>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border"
              >
                #{userId}
              </span>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Contact
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{userEmail}</span>
              </div>
            </div>

            {/* Branch & Role Assignment */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" /> Branch
                </span>
                <p className="text-xs font-extrabold text-slate-700">Branch #{branchId}</p>
              </div>

              <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-500" /> Role
                </span>
                <p className="text-xs font-extrabold text-indigo-800">Role #{roleId}</p>
              </div>
            </div>

            {/* Status & Created Date */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                {createdAt && (
                  <>
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Joined {createdAt}</span>
                  </>
                )}
              </div>
              <Badge
                variant={user.status === 'INACTIVE' ? 'red' : 'green'}
                icon={CheckCircle2}
              >
                {user.status || 'ACTIVE'}
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
