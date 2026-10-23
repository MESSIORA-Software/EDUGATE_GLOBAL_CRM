import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../../actions/Admin/userActions';
import { fetchRoles } from '../../../../actions/Admin/roleActions';
import Button from '../../../ui/Button';
import { X, AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';

export default function UserUpdateModal({ isOpen, user, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.users);
  const { roles = [] } = useSelector((state) => state.roles ?? {});

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [localError, setLocalError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!roles || roles.length === 0) {
        dispatch(fetchRoles());
      }
    }
  }, [isOpen, roles, dispatch]);

  useEffect(() => {
    if (user) {
      setUserId(user.user_id || user.id || '');
      setName(user.name || '');
      setRoleId(user.role_id || 'EDUGATE_STAFF');
      setEmail(user.email || '');
      setPassword('');
      setStatus(user.status || 'ACTIVE');
      setLocalError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const formattedUserId = userId
    ? String(userId).startsWith('EDU_USER_')
      ? String(userId)
      : `EDU_USER_${userId}`
    : '';

  const originalEmail = (user?.email || '').trim().toLowerCase();
  const currentEmail = email.trim().toLowerCase();
  const isEmailChanged = Boolean(originalEmail && currentEmail && currentEmail !== originalEmail);

  const originalRoleId = String(user?.role_id ?? '').trim();
  const currentRoleId = String(roleId ?? '').trim();
  const isRoleChanged = Boolean(originalRoleId && currentRoleId && currentRoleId !== originalRoleId);

  const requiresNewPassword = isEmailChanged || isRoleChanged;

  const handleCopyId = () => {
    if (!formattedUserId) return;
    navigator.clipboard?.writeText(formattedUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('User name is required.');
      return;
    }
    if (!roleId) {
      setLocalError('Please select a system role.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email address is required.');
      return;
    }
    if (requiresNewPassword && !password.trim()) {
      setLocalError('Please assign a new temporary password because the email address or system role was modified.');
      return;
    }

    const payload = {
      user_id: userId,
      branch_id: user?.branch_id || 1,
      name: name.trim(),
      email: email.trim(),
      role_id: isNaN(Number(roleId)) ? roleId : Number(roleId),
      status: status,
    };

    if (requiresNewPassword && password.trim()) {
      payload.password = password.trim();
      payload.password_hash = password.trim();
    }

    const res = await dispatch(updateUser(payload));
    if (res?.success) {
      onSuccess?.(`User '${name.trim()}' updated successfully!`);
      onClose();
    } else {
      setLocalError(res?.error || 'Failed to update user.');
    }
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
                Edit User Account
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Update credentials, assigned role, and account status
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

          {/* Drawer Body Form */}
          <form id="user-update-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* User Identity Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    User Information & Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Core authentication credentials and permissions role
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    {formattedUserId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all text-xs cursor-pointer"
                    title="Copy User ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasun Perera"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>

              {/* Role (placed directly after Full Name) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                >
                  {roles.length > 0 ? (
                    roles.map((r) => {
                      const rId = r.role_id || r.id;
                      return (
                        <option key={rId} value={rId}>
                          {r.role_name || r.name || rId} ({rId})
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="EDUGATE_STAFF">Staff (EDUGATE_STAFF)</option>
                      <option value="EDUGATE_ADMIN">Admin (EDUGATE_ADMIN)</option>
                      <option value="EDUGATE_SUPER_ADMIN">Super Admin (EDUGATE_SUPER_ADMIN)</option>
                    </>
                  )}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Select the system permissions tier for this user account
                </p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. kasun@edugateglobal.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>

              {/* Conditional Password Assignment (Only visible when Email or Role is changed) */}
              {requiresNewPassword && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        {isEmailChanged && isRoleChanged
                          ? 'Email Address & Role Modified'
                          : isEmailChanged
                          ? 'Email Address Modified'
                          : 'System Role Modified'}
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        Because the {isEmailChanged && isRoleChanged ? 'email address and system role have' : isEmailChanged ? 'email address has' : 'system role has'} been updated, you must assign a new temporary password. An email with new credentials and a password reset button will be automatically sent to the user.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      New Temporary Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new temporary password..."
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (localError) setLocalError('');
                        }}
                        required={requiresNewPassword}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('ACTIVE')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      status === 'ACTIVE'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('INACTIVE')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      status === 'INACTIVE'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Drawer Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="user-update-form"
              variant="primary"
              size="md"
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
