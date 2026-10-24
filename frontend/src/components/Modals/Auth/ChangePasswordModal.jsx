import React, { useState } from 'react';
import authService from '../../../services/Auth/authService';
import Button from '../../ui/Button';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function ChangePasswordModal({ isOpen, user, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const userEmail = user?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword.trim()) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword.trim() === newPassword.trim()) {
      setError('New password must be different from your current password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.changePassword({
        email: userEmail,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      try {
        sessionStorage.setItem('current_user_pwd', newPassword.trim());
      } catch {
        // Ignore storage exceptions
      }

      if (onSuccess) {
        onSuccess(
          newPassword.trim(),
          res?.message || 'Password changed successfully.'
        );
      }
      onClose();
    } catch (err) {
      setError(
        err?.message ||
          'Failed to change password. Please ensure your current password is correct.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isMatching =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatched =
    newPassword && confirmPassword && newPassword !== confirmPassword;

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
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Change Account Password
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Update your authentication credentials and account security
                </p>
              </div>
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

          {/* Drawer Form Content */}
          <form
            id="change-password-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Account Info Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Target Account
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {user?.name || user?.fullName || 'User'}
                </p>
                <p className="text-[11px] text-slate-500">{userEmail}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Verified
              </span>
            </div>

            {/* Password Fields Section */}
            <div className="space-y-4">
              {/* Field 1: Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter current account password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your current active password to authenticate this update.
                </p>
              </div>

              {/* Field 2: New Password */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Must be at least 6 characters with a secure mix of letters and numbers.
                </p>
              </div>

              {/* Field 3: Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full pl-9 pr-10 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                      isMismatched
                        ? 'border-rose-300 focus:ring-rose-500'
                        : isMatching
                        ? 'border-emerald-300 focus:ring-emerald-500'
                        : 'border-slate-200 focus:ring-blue-600 focus:border-transparent'
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isMismatched && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    Passwords do not match.
                  </p>
                )}
                {isMatching && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passwords match.
                  </p>
                )}
              </div>
            </div>

            {/* Security Notice Card */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Security Guidelines</span>
              </div>
              <ul className="text-[11px] text-blue-900/80 space-y-1 pl-6 list-disc">
                <li>Never reuse passwords from other services.</li>
                <li>Your session credentials will automatically refresh upon confirmation.</li>
                <li>You will be able to view and manage this password from My Profile.</li>
              </ul>
            </div>
          </form>

          {/* Drawer Sticky Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="change-password-form"
              loading={submitting}
              disabled={submitting}
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
