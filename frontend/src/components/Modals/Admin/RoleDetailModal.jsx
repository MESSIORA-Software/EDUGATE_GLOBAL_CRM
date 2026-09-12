import React from 'react';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { X, ShieldCheck, CheckCircle2, Hash, Calendar, Layers } from 'lucide-react';

export default function RoleDetailModal({ isOpen, role, onClose }) {
  if (!isOpen || !role) return null;

  const roleId = role.role_id || role.id || 'N/A';
  const roleName = role.role_name || role.name || 'N/A';
  const createdAt = role.created_at
    ? new Date(role.created_at).toLocaleDateString('en-US', {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>{roleName}</h3>
              <p className={TYPOGRAPHY.caption}>System Access Role Definition</p>
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
            {/* Role ID */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Role Identifier</span>
              </div>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border"
              >
                {roleId}
              </span>
            </div>

            {/* Role Name */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Role Description
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{roleName}</span>
              </div>
            </div>

            {/* Status & Created At */}
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
                Active Role
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
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
