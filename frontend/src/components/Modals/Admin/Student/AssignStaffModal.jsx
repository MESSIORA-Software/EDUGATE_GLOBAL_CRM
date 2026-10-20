import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import PipelineService from '../../../../services/Admin/pipelineService';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, UserCheck, AlertCircle, User, Shield, Check } from 'lucide-react';

export default function AssignStaffModal({ isOpen, opportunity, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { users: staffUsers = [], loading: loadingUsers = false } = useSelector(
    (state) => state.users ?? {}
  );

  const onlyStaffUsers = React.useMemo(() => {
    return staffUsers.filter((u) => String(u.role_id || u.role || '').toUpperCase() === 'STAFF');
  }, [staffUsers]);

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (staffUsers.length === 0) {
        dispatch(fetchUsers());
      }
      setSelectedStaffId(opportunity?.assigned_staff_id ? String(opportunity.assigned_staff_id) : '');
      setError('');
    }
  }, [isOpen, opportunity, dispatch, staffUsers.length]);

  if (!isOpen || !opportunity) return null;

  const studentName = opportunity?.client?.name || `Student #${opportunity?.client_id || ''}`;

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      await PipelineService.updateOpportunity(
        opportunity.opportunity_id,
        opportunity.client_id,
        opportunity.status_id,
        selectedStaffId ? Number(selectedStaffId) : null,
        opportunity.note_id || null
      );

      const assignedUser = staffUsers.find((u) => String(u.user_id || u.id) === selectedStaffId);
      const staffName = assignedUser?.name || 'Staff member';

      onSuccess?.(
        selectedStaffId
          ? `Assigned ${staffName} to opportunity #${opportunity.opportunity_id}`
          : `Unassigned staff from opportunity #${opportunity.opportunity_id}`
      );
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to update assigned staff.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs"
            >
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={TYPOGRAPHY.heading}>Assign Staff Member</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  #OPP-{opportunity.opportunity_id}
                </span>
              </div>
              <p className={TYPOGRAPHY.caption}>{studentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleAssign} className="p-5 space-y-4">
          {error && (
            <div className="flex gap-2.5 p-3 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-2`}>Select Staff Member</label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {/* Option to Unassign */}
              <button
                type="button"
                onClick={() => setSelectedStaffId('')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedStaffId === ''
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">
                    -
                  </div>
                  <span>Unassigned</span>
                </div>
                {selectedStaffId === '' && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {onlyStaffUsers.map((u) => {
                const uId = String(u.user_id || u.id);
                const isSelected = selectedStaffId === uId;
                const initials = (u.name || 'ST').substring(0, 2).toUpperCase();

                return (
                  <button
                    key={uId}
                    type="button"
                    onClick={() => setSelectedStaffId(uId)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="truncate font-bold text-slate-800">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.email || u.role_name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
