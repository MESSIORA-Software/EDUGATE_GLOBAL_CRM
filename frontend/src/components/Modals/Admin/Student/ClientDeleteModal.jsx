import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteClient } from '../../../../actions/Admin/clientAction';
import { fetchPipelineData } from '../../../../actions/Admin/pipelineAction';
import useAuth from '../../../../hooks/Auth/useAuth';
import authService from '../../../../services/Auth/authService';
import { X, Loader2, AlertCircle, Eye, EyeOff, Check, FileQuestion } from 'lucide-react';

const REASON_OPTIONS = [
  'Duplicate Student Profile',
  'Withdrawn / Cancelled Inquiry',
  'Enrolled with Another Agency / Institution',
  'Client Requested Record Deletion',
  'Invalid / Test Entry',
  'Other Reason (Specify below)',
];

export default function ClientDeleteModal({ isOpen, client, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { deleting } = useSelector((state) => state.client ?? {});
  const { user: currentUser } = useAuth();

  const [localError, setLocalError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

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
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  const clientId = client.client_id || client.id || '';
  const formattedClientId = clientId
    ? String(clientId).startsWith('EDU_STUDENT_')
      ? String(clientId)
      : `EDU_STUDENT_${clientId}`
    : 'N/A';
  const clientName = client.name || 'Unnamed Student';
  const clientEmail = client.email || 'N/A';
  const source = client.source || 'Direct Contact';
  const dob = client.dob || 'Not specified';

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
      setLocalError('Please verify your password to authorize student deletion.');
      return;
    }

    const finalReason =
      selectedReason === 'Other Reason (Specify below)'
        ? customReason.trim()
        : selectedReason;

    const res = await dispatch(deleteClient(clientId));
    if (res?.success) {
      // Also refresh pipeline immediately to remove opportunity card
      dispatch(fetchPipelineData());
      onSuccess?.(`Student '${clientName}' deleted successfully!`);
      onClose();
    } else {
      setLocalError(res?.error || 'Failed to delete student.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-150">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity cursor-pointer"
        onClick={!deleting && !isVerifying ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Centered Modal Dialog */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 z-10">
          {/* Header without icon */}
          <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Delete Student Confirmation
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Confirm student removal, specify reason, and authenticate deletion. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={deleting || isVerifying}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Student Details & Input Content */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Student Profile Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Student Name :</span>
                  <span className="font-bold text-slate-900 truncate text-right">{clientName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Student ID :</span>
                  <span className="font-mono font-bold text-slate-900 truncate text-right">
                    {formattedClientId}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Email :</span>
                  <span className="font-semibold text-slate-800 truncate text-right">{clientEmail}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Lead Source :</span>
                  <span className="font-semibold text-slate-800 truncate text-right">{source}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Date of Birth :</span>
                  <span className="font-semibold text-slate-800 truncate text-right">{dob}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 text-xs leading-relaxed">
                <p className="font-semibold text-slate-900">
                  This student profile will be permanently removed.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Opportunity pipeline cards will be purged and referring partner score points adjusted.
                </p>
              </div>
            </div>

            {/* Reason for Deletion */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-blue-600" />
                Reason for deleting this student <span className="text-rose-500">*</span>
              </label>

              <select
                value={selectedReason}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  if (reasonError) setReasonError('');
                }}
                disabled={deleting}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {selectedReason === 'Other Reason (Specify below)' && (
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                  placeholder="Please describe why this student is being deleted..."
                  disabled={deleting}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                />
              )}

              {reasonError && (
                <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{reasonError}</span>
                </p>
              )}
            </div>

            {/* Admin Password Verification Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                If you want to delete this student, enter your password:
              </label>
              <p className="text-[11px] text-slate-500 leading-snug">
                Enter your current account password to authorize student deletion.
              </p>

              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    name="admin_student_delete_security_token"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    readOnly={!isInputFocused}
                    onFocus={() => setIsInputFocused(true)}
                    placeholder="Enter your password..."
                    value={adminPassword}
                    disabled={isVerified || isVerifying || deleting}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (isVerified) setIsVerified(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isVerified) {
                        e.preventDefault();
                        handleVerifyPassword();
                      }
                    }}
                    className={`w-full pl-3 pr-9 py-2 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs ${
                      isVerified
                        ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900 cursor-not-allowed'
                        : passwordError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isVerified}
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer disabled:opacity-40"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {!isVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyPassword}
                    disabled={isVerifying || !adminPassword.trim() || deleting}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {passwordError && (
                <p className="text-[11px] font-medium text-rose-600 pt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}

              {isVerified && (
                <p className="text-[11px] font-medium text-emerald-700 pt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                  <span>Password correct. You can now delete this student.</span>
                </p>
              )}
            </div>

            {/* Error Message */}
            {localError && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting || isVerifying}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting || !isVerified}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-all ${
                isVerified
                  ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                  : 'bg-red-400 opacity-60 cursor-not-allowed'
              }`}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Student</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
