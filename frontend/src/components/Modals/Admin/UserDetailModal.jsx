import React from 'react';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { X, UserCheck, Code, CheckCircle2 } from 'lucide-react';

export default function UserDetailModal({ isOpen, user, onClose }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.primaryBorder }}
          className="flex items-center justify-between px-5 py-3 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>User Account Details</h3>
              <p className={TYPOGRAPHY.caption}>API Find By ID Payload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
            className="border rounded-xl p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>User ID</span>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border"
              >
                {user.user_id || user.id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Full Name</span>
              <span className="font-bold text-xs" style={{ color: COLORS.foreground }}>
                {user.name || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Email Address</span>
              <span className="font-medium text-xs text-indigo-700">
                {user.email || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Branch ID / Role ID</span>
              <span className="font-semibold text-xs text-slate-700">
                Branch #{user.branch_id || 1} • Role #{user.role_id || 1}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Status</span>
              <Badge variant={user.status === 'INACTIVE' ? 'red' : 'green'} icon={CheckCircle2}>
                {user.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Code className="w-3.5 h-3.5" style={{ color: COLORS.muted }} />
              <span className={TYPOGRAPHY.label}>Raw JSON Response</span>
            </div>
            <pre
              style={{ backgroundColor: COLORS.foreground, color: '#34D399' }}
              className="p-3 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner max-h-48"
            >
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }} className="flex items-center justify-end px-5 py-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
