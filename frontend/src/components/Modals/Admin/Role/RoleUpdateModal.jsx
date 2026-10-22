import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateRole } from '../../../../actions/Admin/roleActions';
import Button from '../../../ui/Button';
import { X, AlertCircle } from 'lucide-react';

export default function RoleUpdateModal({ isOpen, role, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.roles);

  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [status, setStatus] = useState('Active');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (role) {
      setRoleId(role.role_id || '');
      setRoleName(role.role_name || '');
      setStatus(role.status || 'Active');
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const trimmedName = roleName.trim();
    if (!trimmedName) {
      setLocalError('Role Name is required.');
      return;
    }

    const res = await dispatch(updateRole(role.role_id, trimmedName, status));
    if (res.success) {
      onSuccess?.('Role updated successfully!');
      onClose();
    } else {
      setLocalError(res.error || 'Failed to update role.');
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
          {/* Drawer Header (without icon) */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Update System Role
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Modify role title and status properties
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
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              {(localError || error) && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{localError || error}</span>
                </div>
              )}

              {/* Role Identification Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Role Identification
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    Role Key & Title
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Role ID (System Key)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      Permanent Key
                    </span>
                  </div>
                  <input
                    type="text"
                    value={roleId}
                    disabled
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-700 cursor-not-allowed select-none shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    System role identifiers are permanent keys used to bind permissions across user records.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Counselor"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This friendly name is shown on user account profiles and role badges.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select whether this role is currently active or inactive.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white flex items-center justify-end gap-3 shrink-0 shadow-lg">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={submitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
