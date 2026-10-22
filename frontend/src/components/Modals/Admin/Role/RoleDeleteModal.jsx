import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteRole } from '../../../../actions/Admin/roleActions';
import userService from '../../../../services/Admin/userService';
import { X, Loader2, AlertCircle, Users } from 'lucide-react';

export default function RoleDeleteModal({ isOpen, role, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((state) => state.roles);

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const [localError, setLocalError] = useState('');

  const roleId = role?.role_id || role?.id || '';
  const roleName = role?.role_name || role?.name || roleId;

  useEffect(() => {
    let isMounted = true;

    const checkAssignedUsers = async () => {
      if (!roleId) return;
      setCheckingUsers(true);
      try {
        const res = await userService.getUsersByRole(roleId);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (isMounted) {
          setAssignedUsers(list);
        }
      } catch (err) {
        console.warn('Could not fetch assigned users:', err);
        if (isMounted) setAssignedUsers([]);
      } finally {
        if (isMounted) setCheckingUsers(false);
      }
    };

    if (isOpen && role) {
      setLocalError('');
      checkAssignedUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, role, roleId]);

  if (!isOpen || !role) return null;

  const hasAssignedUsers = assignedUsers.length > 0;

  const handleConfirmDelete = async () => {
    if (hasAssignedUsers) {
      setLocalError('Cannot delete role because users are currently assigned to this role.');
      return;
    }

    setLocalError('');
    const res = await dispatch(deleteRole(roleId));
    if (res.success) {
      onSuccess?.(`Role '${roleName}' deleted successfully!`);
      onClose();
    } else {
      setLocalError(res.error || 'Failed to delete role.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-150">
      {/* Background stays completely unchanged (NO blur, NO dark shading) */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity cursor-pointer"
        onClick={!submitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Centered Modal Dialog */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 z-10">
          {/* Header without icon */}
          <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Delete Role Confirmation
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this role? This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Details & Status Content */}
          <div className="p-6 space-y-4">
            {/* Unified Card (same background for details and notice) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Role Name :</span>
                  <span className="font-bold text-slate-900 truncate text-right">{roleName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Role ID :</span>
                  <span className="font-mono font-bold text-slate-900 truncate text-right">{roleId}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500 shrink-0">Status :</span>
                  <span
                    className={`font-semibold shrink-0 ${
                      role.status === 'Inactive' ? 'text-slate-500' : 'text-slate-800'
                    }`}
                  >
                    {role.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Status Notice inside same background (no green background) */}
              {checkingUsers ? (
                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Checking assigned users...</span>
                </div>
              ) : !hasAssignedUsers ? (
                <div className="pt-3 border-t border-slate-200/80 text-xs leading-relaxed">
                  <p className="font-semibold text-slate-900">
                    This role has no assigned users.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    You can safely delete this role from the system.
                  </p>
                </div>
              ) : null}
            </div>

            {/* If Users are Assigned - Show Assigned Users List & Restriction Notice */}
            {!checkingUsers && hasAssignedUsers && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    Assigned Users ({assignedUsers.length})
                  </span>
                </div>

                {/* Formal User Labels List */}
                <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {assignedUsers.map((u, i) => (
                    <div
                      key={u.user_id || u.id || i}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {u.name || u.email}
                        </span>
                        {u.email && u.name && (
                          <span className="text-[11px] text-slate-400 truncate">
                            ({u.email})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                        {u.role_id || roleId}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Formal Warning Message */}
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-red-900">
                      Cannot delete role because users are currently assigned to this role.
                    </p>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Please reassign or remove all assigned users before attempting to delete this role.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message if API fails */}
            {localError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{localError}</span>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={submitting || checkingUsers || hasAssignedUsers}
              title={
                hasAssignedUsers
                  ? 'Cannot delete role because users are currently assigned to this role'
                  : 'Delete Role'
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                hasAssignedUsers || checkingUsers
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              } disabled:opacity-70`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Role</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
