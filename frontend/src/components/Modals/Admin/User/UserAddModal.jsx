import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../../actions/Admin/userActions';
import { fetchRoles } from '../../../../actions/Admin/roleActions';
import Button from '../../../ui/Button';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function UserAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.users);
  const { roles = [] } = useSelector((state) => state.roles ?? {});

  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!roles || roles.length === 0) {
        dispatch(fetchRoles());
      }
    }
  }, [isOpen, roles, dispatch]);

  useEffect(() => {
    if (roles && roles.length > 0 && !roleId) {
      setRoleId(roles[0].role_id || roles[0].id || 'EDUGATE_STAFF');
    }
  }, [roles, roleId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setLocalError('');
    onClose();
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
    if (!password.trim()) {
      setLocalError('Password is required.');
      return;
    }

    const payload = {
      branch_id: 1,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      password_hash: password.trim(),
      role_id: isNaN(Number(roleId)) ? roleId : Number(roleId),
      status: status,
      created_by: null,
    };

    const res = await dispatch(registerUser(payload));
    if (res?.success) {
      handleClose();
      onSuccess?.('User created successfully!');
    } else {
      setLocalError(res?.error || 'Failed to create user.');
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop (sidebar remains fully available and interactive) */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header without icon */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Add New User
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Create system user account, credentials, and role assignment
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Form */}
          <form id="user-add-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* User Identity & Credentials Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  User Information & Credentials
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Core identity details and system permissions role
                </p>
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

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure initial password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (localError) setLocalError('');
                    }}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
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
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="user-add-form"
              variant="primary"
              size="md"
              loading={submitting}
            >
              Create User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
