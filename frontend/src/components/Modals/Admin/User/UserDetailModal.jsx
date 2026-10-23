import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../../ui/Button';
import { X, Copy, Check, Calendar } from 'lucide-react';

export default function UserDetailModal({ isOpen, user, onClose, onEdit }) {
  const { roles = [] } = useSelector((state) => state.roles ?? {});

  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !user) return null;

  const rawUserId = user.user_id || user.id || '';
  const formattedUserId = rawUserId
    ? String(rawUserId).startsWith('EDU_USER_')
      ? String(rawUserId)
      : `EDU_USER_${rawUserId}`
    : 'N/A';

  const userName = user.name || 'Unnamed User';
  const userEmail = user.email || 'No email provided';
  const roleId = user.role_id || 'EDUGATE_STAFF';

  const matchedRole = roles?.find((r) => String(r.role_id || r.id) === String(roleId));
  const roleDisplayName = user.role_name || matchedRole?.role_name || matchedRole?.name || String(roleId);

  const status = user.status || 'Active';
  const displayStatus = String(status).toUpperCase() === 'ACTIVE' ? 'Active' : status;

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleCopyId = () => {
    if (!formattedUserId || formattedUserId === 'N/A') return;
    navigator.clipboard?.writeText(formattedUserId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = () => {
    if (!userEmail || userEmail === 'No email provided') return;
    navigator.clipboard?.writeText(userEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
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
          {/* Drawer Header without icon */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {userName}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                System user account identity and credentials
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
            {/* User Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  User Identity
                </h3>
                <span className="text-[11px] font-medium text-slate-400">
                  Authentication & Contact
                </span>
              </div>

              {/* User ID */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  User ID
                </span>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-900 tracking-wide truncate block">
                      {formattedUserId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all text-[11px] font-semibold cursor-pointer shrink-0 shadow-2xs"
                    title="Copy User ID"
                  >
                    {copiedId ? (
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

              {/* Role (placed directly after User ID) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {roleDisplayName}
                  </span>
                </div>
              </div>

              {/* Email Address (without mail icon) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </span>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-800 truncate block">
                      {userEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all text-[11px] font-semibold cursor-pointer shrink-0 shadow-2xs"
                    title="Copy Email"
                  >
                    {copiedEmail ? (
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

              {/* Account Status (normally black, no green highlight) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Status
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-900 block">
                    {displayStatus}
                  </span>
                </div>
              </div>

              {/* Created At Date */}
              {createdAt && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Account Created: <strong className="text-slate-700 font-medium">{createdAt}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
              >
                Edit User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
