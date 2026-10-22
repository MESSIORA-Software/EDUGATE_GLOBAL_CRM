import React, { useState } from 'react';
import Button from '../../../ui/Button';
import { X, Calendar, Copy, Check } from 'lucide-react';

export default function RoleDetailModal({ isOpen, role, onClose, onEdit }) {
  const [copied, setCopied] = useState(false);

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

  const handleCopyId = () => {
    if (!roleId || roleId === 'N/A') return;
    navigator.clipboard?.writeText(roleId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop (sidebar remains fully available and interactive) */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header (without icon) */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {roleName}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                System access role definition and details
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

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
            {/* Role Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Role Identity
                </h3>
                <span className="text-[11px] font-medium text-slate-400">
                  System Specifications
                </span>
              </div>

              {/* Role ID with Copy */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role Identifier
                </span>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-800 tracking-wide truncate block">
                      {roleId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all text-[11px] font-semibold cursor-pointer shrink-0 shadow-2xs"
                    title="Copy Role ID"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Role Display Name */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  <span>{roleName}</span>
                </div>
              </div>

              {/* Status and Created Date */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{createdAt ? `Created ${createdAt}` : 'System role'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span>Status:</span>
                  <span className={`font-semibold ${role.status === 'Inactive' ? 'text-slate-500' : 'text-slate-700'}`}>
                    {role.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white flex items-center justify-end gap-3 shrink-0 shadow-lg">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(role);
                }}
              >
                Edit Role
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
