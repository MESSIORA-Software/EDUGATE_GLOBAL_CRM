import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersByBranch } from '../../../actions/Admin/branchAction';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { X, Users, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Mail, Loader2 } from 'lucide-react';

export default function BranchUsersModal({ isOpen, branch, onClose }) {
  const dispatch = useDispatch();
  const { users: branchUsers = [], usersLoading = false, error } = useSelector(
    (state) => state.branch ?? {}
  );

  const branchId = branch?.branch_id || branch?.id;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Users in {branch.name || `Branch #${branchId}`}</h3>
              <p className={TYPOGRAPHY.caption}>
                Branch ID #{branchId} • {usersList.length} user{usersList.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
              className="p-1.5 rounded-lg border hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh Users"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin text-[#1E3A8A]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              style={{ color: COLORS.muted }}
              className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {error && (
            <div
              style={{
                backgroundColor: COLORS.secondaryLight,
                borderColor: COLORS.secondaryBorder,
                color: COLORS.secondary,
              }}
              className="flex items-center gap-2 p-2.5 border rounded-xl text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {usersLoading && usersList.length === 0 ? (
            <div className="py-12 text-center" style={{ color: COLORS.muted }}>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
              <p className="font-semibold text-xs">Loading Branch Users...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-12 text-center" style={{ color: COLORS.placeholder }}>
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>
                No Users Assigned
              </p>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                There are no user accounts currently registered to this branch.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
                    className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {usersList.map((u, idx) => (
                    <tr key={u.user_id || u.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          style={{
                            backgroundColor: COLORS.primaryLight,
                            color: COLORS.primary,
                            borderColor: COLORS.primaryBorder,
                          }}
                          className="px-2 py-0.5 rounded-md border text-[11px]"
                        >
                          #{u.user_id || u.id}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold" style={{ color: COLORS.foreground }}>
                        {u.name || 'Unnamed User'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" />
                          Role #{u.role_id || 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={u.status === 'INACTIVE' ? 'red' : 'green'}
                          icon={CheckCircle2}
                        >
                          {u.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}
          className="flex items-center justify-end px-5 py-3 border-t shrink-0"
        >
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
