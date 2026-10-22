import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersByBranch } from '../../../../actions/Admin/branchAction';
import Button from '../../../ui/Button';
import { X, RefreshCw, AlertCircle, Users, Loader2 } from 'lucide-react';

export default function BranchUsersModal({ isOpen, branch, onClose }) {
  const dispatch = useDispatch();
  const { users: branchUsers = [], usersLoading = false, error } = useSelector(
    (state) => state.branch ?? {}
  );

  const branchId = branch?.branch_id || branch?.id;
  const branchName = branch?.name || branch?.branch_name || `Branch #${branchId}`;
  const displayCode = branch?.branch_code || `EDUGATE_${(branchName || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;

  useEffect(() => {
    if (isOpen && branchId) {
      dispatch(fetchUsersByBranch(branchId));
    }
  }, [isOpen, branchId, dispatch]);

  if (!isOpen || !branch) return null;

  const handleRefresh = () => {
    if (branchId) {
      dispatch(fetchUsersByBranch(branchId));
    }
  };

  const usersList = Array.isArray(branchUsers) ? branchUsers : [];

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
                {branchName} — Assigned Users
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {displayCode} • {usersList.length} user{usersList.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh users"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {usersLoading && usersList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-semibold">Loading assigned users...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-800">No Users Assigned</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  There are currently no staff or accounts assigned to this branch location.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Active Personnel ({usersList.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {usersList.map((user, idx) => {
                    const uName = user.name || user.email || 'Unnamed User';
                    const uRole = user.role_id || user.role || 'STAFF';
                    const uInitial = uName.charAt(0).toUpperCase();

                    return (
                      <div
                        key={user.user_id || user.id || idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {uInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {uName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {user.email || 'No email'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200">
                            {uRole}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600">
                            {user.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white flex items-center justify-end gap-3 shrink-0 shadow-lg">
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
