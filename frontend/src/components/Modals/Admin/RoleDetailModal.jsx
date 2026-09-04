import React from 'react';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { X, ShieldCheck, Code, CheckCircle2 } from 'lucide-react';

export default function RoleDetailModal({ isOpen, role, onClose }) {
  if (!isOpen || !role) return null;

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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>System Role Details</h3>
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
            className="border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Role ID</span>
              <span
                style={{
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                  borderColor: COLORS.primaryBorder,
                }}
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border"
              >
                {role.role_id || role.id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Role Name</span>
              <span className="font-bold text-xs" style={{ color: COLORS.foreground }}>
                {role.role_name || role.name || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={TYPOGRAPHY.label}>Status</span>
              <Badge variant="green" icon={CheckCircle2}>
                Active Role
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Code className="w-3.5 h-3.5" style={{ color: COLORS.muted }} />
              <span className={TYPOGRAPHY.label}>JSON Payload</span>
            </div>
            <pre
              style={{ backgroundColor: COLORS.foreground, color: '#34D399' }}
              className="p-3 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner max-h-48"
            >
              {JSON.stringify(role, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }} className="flex items-center justify-end px-5 py-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
