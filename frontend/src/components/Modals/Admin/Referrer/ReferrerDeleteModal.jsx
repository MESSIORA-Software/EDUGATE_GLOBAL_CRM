import React, { useState, useEffect } from 'react';
import ReferrerService from '../../../../services/Admin/referrerService';
import useAuth from '../../../../hooks/Auth/useAuth';
import authService from '../../../../services/Auth/authService';
import { X, Loader2, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

const REASON_OPTIONS = [
  'Terminated Partnership Agreement',
  'Duplicate Partner Profile',
  'Partner Inactive / No Recent Activity',
  'Partner Requested Account Removal',
  'Invalid / Test Entry',
  'Other Reason (Specify below)',
];

export default function ReferrerDeleteModal({ isOpen, referrer, onClose, onSuccess }) {
  const { user: currentUser } = useAuth();

  const [localError, setLocalError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reason state
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAdminPassword('');
      setShowAdminPassword(false);
      setIsVerifying(false);
      setIsVerified(false);
      setPasswordError('');
      setLocalError('');
      setIsInputFocused(false);
      setSelectedReason(REASON_OPTIONS[0]);
      setCustomReason('');
      setReasonError('');
      setDeleting(false);
    }
  }, [isOpen, referrer]);

  if (!isOpen || !referrer) return null;

  const referrerId = referrer.referrer_id || referrer.id;
  const referrerCode = referrer.referrer_code || 'EDUGATE_REFERRER';
  const referrerName = referrer.name || 'Unnamed Partner';
  const referrerEmail = referrer.email || 'No email provided';
  const referrerPhone = referrer.phone_number || referrer.whatsapp_number || 'No phone provided';

  const handleVerifyPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setLocalError('');

    if (!adminPassword.trim()) {
      setPasswordError('Please enter your password.');
      return;
    }

    try {
      setIsVerifying(true);
      await authService.verifyPassword(adminPassword.trim(), currentUser?.email);
      setIsVerified(true);
      setPasswordError('');
    } catch (err) {
      setIsVerified(false);
      setPasswordError(err.message || 'Incorrect password. Please enter your valid current password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLocalError('');
    setReasonError('');

    if (selectedReason === 'Other Reason (Specify below)' && !customReason.trim()) {
      setReasonError('Please provide a brief explanation for deletion.');
      return;
    }

    if (!isVerified) {
      setLocalError('Please verify your administrator password to authorize partner deletion.');
      return;
    }

    try {
      setDeleting(true);
      await ReferrerService.deleteReferrer(referrerId);
      onSuccess?.(`Referrer "${referrerName}" (${referrerCode}) deleted successfully.`);
      onClose();
    } catch (err) {
      setLocalError(
        err?.response?.data?.message || err?.message || 'Failed to delete referrer. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Delete Referrer Partner
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently delete referral partner and deactivate code
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {localError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{localError}</span>
              </div>
            )}

            {/* Referrer Details Card */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                  {referrerCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (referrer.status || 'Active') === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {referrer.status || 'Active'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{referrerName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{referrerEmail}</p>
                <p className="text-xs text-slate-500 mt-0.5">{referrerPhone}</p>
                {referrer.home_address && (
                  <p className="text-xs text-slate-400 mt-1 truncate">{referrer.home_address}</p>
                )}
              </div>
            </div>


            {/* Deletion Reason Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Reason for Deletion <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  setReasonError('');
                }}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {selectedReason === 'Other Reason (Specify below)' && (
                <div className="pt-2">
                  <textarea
                    rows={3}
                    placeholder="Provide specific details or documentation regarding this partner deletion..."
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setReasonError('');
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {reasonError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{reasonError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Password Authorization Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Administrator Password Authorization <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Please enter your administrator account password to confirm deletion authorization.
              </p>

              <form onSubmit={handleVerifyPassword} className="space-y-2">
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Enter current administrator password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setIsVerified(false);
                      setPasswordError('');
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className={`w-full pl-3.5 pr-20 py-2.5 border rounded-xl text-xs bg-white text-slate-800 focus:outline-none transition-all ${
                      isVerified
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : passwordError
                        ? 'border-rose-400 ring-2 ring-rose-400/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {!isVerified && adminPassword && (
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer transition-colors"
                      >
                        {isVerifying ? 'Checking...' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>

                {passwordError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{passwordError}</p>
                )}

                {isVerified && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Administrator identity verified. Deletion authorized.</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleConfirmDelete}
              disabled={!isVerified || deleting}
              loading={deleting}
              className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border-transparent"
            >
              Confirm & Delete Partner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
