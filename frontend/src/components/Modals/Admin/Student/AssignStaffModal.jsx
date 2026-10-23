import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import userService from '../../../../services/Admin/userService';
import PipelineService from '../../../../services/Admin/pipelineService';
import Button from '../../../ui/Button';
import { X, UserCheck, AlertCircle, User, Shield, Check, LoaderCircle, Search, UserMinus } from 'lucide-react';
import { isStaffUser } from '../../../../utils/roleUtils';

export default function AssignStaffModal({ isOpen, opportunity, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { users: staffUsers = [], loading: loadingUsers = false } = useSelector(
    (state) => state.users ?? {}
  );

  const [localUsers, setLocalUsers] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const combinedUsers = staffUsers.length > 0 ? staffUsers : localUsers;

  const onlyStaffUsers = React.useMemo(() => {
    return combinedUsers.filter((u) => {
      const isActive = !u.status || String(u.status).toUpperCase() === 'ACTIVE';
      return isActive && isStaffUser(u);
    });
  }, [combinedUsers]);

  const filteredStaffUsers = React.useMemo(() => {
    if (!searchTerm.trim()) return onlyStaffUsers;
    const term = searchTerm.toLowerCase();
    return onlyStaffUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        String(u.user_id || u.id).includes(term)
    );
  }, [onlyStaffUsers, searchTerm]);

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (staffUsers.length === 0) {
        dispatch(fetchUsers());
        setLoadingLocal(true);
        userService
          .getAllUsers()
          .then((res) => {
            const list = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.users)
              ? res.users
              : [];
            setLocalUsers(list);
          })
          .catch((err) => {
            console.error('Error fetching fallback users:', err);
          })
          .finally(() => {
            setLoadingLocal(false);
          });
      }
      setSelectedStaffId(opportunity?.assigned_staff_id ? String(opportunity.assigned_staff_id) : '');
      setError('');
      setSearchTerm('');
    }
  }, [isOpen, opportunity, dispatch, staffUsers.length]);

  if (!isOpen || !opportunity) return null;

  const student = opportunity?.client || {};
  const studentName = student.name || `Student #${opportunity?.client_id || ''}`;

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

      const assignedUser = combinedUsers.find((u) => String(u.user_id || u.id) === selectedStaffId);
      const staffName = assignedUser?.name || 'Staff member';

      onSuccess?.(
        selectedStaffId
          ? `Assigned ${staffName} to opportunity EDU_OPP_${opportunity.opportunity_id}`
          : `Unassigned staff from opportunity EDU_OPP_${opportunity.opportunity_id}`
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

  const isLoading = (loadingUsers || loadingLocal) && combinedUsers.length === 0;

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
                Assign Staff Member
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage staff ownership for this student opportunity
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAssign} className="flex-1 flex flex-col min-h-0">
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="flex gap-2.5 p-3.5 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Opportunity Student Context Card */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                    EDU_OPP_{opportunity.opportunity_id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {studentName}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {student.email || 'No email provided'} {student.phone ? `• ${student.phone}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Current Stage
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {opportunity.status_name || 'Active Opportunity'}
                  </span>
                </div>
              </div>

              {/* Staff Selection Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Staff Member
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    {onlyStaffUsers.length} active staff
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name or email address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Staff List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 pt-1">
                  {/* Option: Unassigned */}
                  <button
                    type="button"
                    onClick={() => setSelectedStaffId('')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedStaffId === ''
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                        <UserMinus className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800">Unassigned</span>
                        <p className="text-[11px] text-slate-500">Remove current assigned staff member</p>
                      </div>
                    </div>
                    {selectedStaffId === '' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>

                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                      <LoaderCircle className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Loading staff team...</span>
                    </div>
                  ) : filteredStaffUsers.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      {searchTerm ? 'No staff member matches your search.' : 'No active staff accounts available.'}
                    </div>
                  ) : (
                    filteredStaffUsers.map((u) => {
                      const uId = String(u.user_id || u.id);
                      const isSelected = selectedStaffId === uId;
                      const initials = (u.name || 'ST').substring(0, 2).toUpperCase();

                      return (
                        <button
                          key={uId}
                          type="button"
                          onClick={() => setSelectedStaffId(uId)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-2xs'
                              : 'border-slate-200 hover:bg-slate-50/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="text-left min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-bold text-slate-800">{u.name}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  Staff
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
              >
                Confirm Assignment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
