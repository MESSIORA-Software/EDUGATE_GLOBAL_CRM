import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createOpportunityForStudent,
  fetchPipelineStatuses,
} from '../../../../actions/Admin/pipelineAction';
import { fetchClients } from '../../../../actions/Admin/clientAction';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import useAuth from '../../../../hooks/Auth/useAuth';
import { getUserRole, isStaffUser } from '../../../../utils/roleUtils';
import Button from '../../../ui/Button';
import {
  X,
  User,
  Layers,
  AlertCircle,
  UserCheck,
  FileText,
  Mail,
  Calendar,
  Share2,
} from 'lucide-react';

const getInitialStatusId = (statusesList) => {
  if (!statusesList || statusesList.length === 0) return 2;
  const hasId1 = statusesList.find((s) => s.status_id === 1);
  if (hasId1) return 1;
  const stage1 = statusesList.find((s) => s.stage_order === 1);
  return stage1?.status_id || statusesList[0]?.status_id || 2;
};

export default function CreateOpportunityModal({
  isOpen,
  client,
  preselectedClientId,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isStaff = userRole === 'STAFF';

  const {
    statuses = [],
    opportunities = [],
    creatingOpportunity = false,
  } = useSelector((state) => state.pipeline ?? {});
  const { list: registeredClients = [] } = useSelector((state) => state.client ?? {});
  const { users: staffUsers = [] } = useSelector((state) => state.users ?? {});

  const availableStaffUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      const isActive = !u.status || String(u.status).toUpperCase() === 'ACTIVE';
      return isActive && isStaffUser(u);
    });
  }, [staffUsers]);

  const existingOppClientIds = useMemo(() => {
    return new Set(opportunities.map((o) => Number(o.client_id)));
  }, [opportunities]);

  const availableClients = useMemo(() => {
    return registeredClients.filter((c) => !existingOppClientIds.has(Number(c.client_id || c.id)));
  }, [registeredClients, existingOppClientIds]);

  // Form states - status_id defaults to stage 1
  const [selectedClientId, setSelectedClientId] = useState('');
  const [statusId, setStatusId] = useState(2);
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (statuses.length === 0) {
        dispatch(fetchPipelineStatuses());
      }
      if (staffUsers.length === 0) {
        dispatch(fetchUsers());
      }
      if (registeredClients.length === 0) {
        dispatch(fetchClients());
      }

      const initialClientId =
        client?.client_id ||
        client?.id ||
        preselectedClientId ||
        '';
      setSelectedClientId(initialClientId ? String(initialClientId) : '');
      setStatusId(getInitialStatusId(statuses));
      setAssignedStaffId(isStaff && user?.user_id ? String(user.user_id) : '');
      setNote('');
      setSubmitError('');
    }
  }, [isOpen, client, preselectedClientId, dispatch, statuses, isStaff, user?.user_id]);

  useEffect(() => {
    if (statuses.length > 0) {
      const currentValid = statuses.some((s) => s.status_id === Number(statusId));
      if (!currentValid) {
        setStatusId(getInitialStatusId(statuses));
      }
    }
  }, [statuses, statusId]);

  if (!isOpen) return null;

  const currentClient =
    client ||
    registeredClients.find(
      (c) => String(c.client_id || c.id) === String(selectedClientId || preselectedClientId)
    );

  const effectiveClientId = currentClient?.client_id || currentClient?.id || selectedClientId;
  const clientName = currentClient?.name || 'Selected Student';
  const formattedClientId = effectiveClientId
    ? String(effectiveClientId).startsWith('EDU_STUDENT_')
      ? String(effectiveClientId)
      : `EDU_STUDENT_${effectiveClientId}`
    : 'N/A';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!effectiveClientId) {
      setSubmitError('Please select a student for this opportunity.');
      return;
    }

    const payload = {
      clientId: Number(effectiveClientId),
      client_id: Number(effectiveClientId),
      statusId: Number(statusId) || 1,
      status_id: Number(statusId) || 1,
      assignedStaffId: assignedStaffId ? Number(assignedStaffId) : null,
      assigned_staff_id: assignedStaffId ? Number(assignedStaffId) : null,
      note: note.trim() || undefined,
    };

    const res = await dispatch(
      createOpportunityForStudent(payload, {
        clientName,
        clientEmail: currentClient?.email || '',
        clientSource: currentClient?.source || 'Direct Contact',
      })
    );

    if (res?.success) {
      onSuccess?.(`Opportunity created for "${clientName}" successfully!`);
      onClose();
    } else {
      setSubmitError(res?.error || 'Failed to create opportunity.');
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
                Create Opportunity
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Convert student inquiry into an active pipeline opportunity
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
          <form
            id="create-opportunity-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Target Student Information Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Target Student Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Selected student inquiry record for pipeline progression
                  </p>
                </div>
                {effectiveClientId && (
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    {formattedClientId}
                  </span>
                )}
              </div>

              {currentClient ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Student Full Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{currentClient.name}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                        Email Address
                      </span>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentClient.email || 'No email provided'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                        Lead Source
                      </span>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentClient.source || 'Direct Contact'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Student / Client <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="">
                        {availableClients.length > 0
                          ? '-- Choose Registered Student --'
                          : '-- All students already in opportunity pipeline --'}
                      </option>
                      {availableClients.map((c) => {
                        const cId = c.client_id || c.id;
                        return (
                          <option key={cId} value={cId}>
                            {c.name || 'Unnamed'} (ID: #{cId}) - {c.email || c.source || 'No email'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline Configuration Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Opportunity Setup
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pipeline stage placement and staff assignment
                </p>
              </div>

              {/* Initial Stage Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Pipeline Stage <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={statusId}
                    onChange={(e) => setStatusId(Number(e.target.value))}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                  >
                    {statuses.length > 0 ? (
                      statuses.map((s) => (
                        <option key={s.status_id} value={s.status_id}>
                          {s.status_name}
                        </option>
                      ))
                    ) : (
                      <option value={1}>Default Stage (Status ID: 1)</option>
                    )}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  The initial stage card where this student will appear on the Opportunity Pipeline board.
                </p>
              </div>

              {/* Assign Staff (Hidden for Staff Users) */}
              {!isStaff && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assign Staff Counselor (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={assignedStaffId}
                      onChange={(e) => setAssignedStaffId(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="">-- Unassigned (General Pool) --</option>
                      {availableStaffUsers.map((u) => {
                        const uId = u.user_id || u.id;
                        return (
                          <option key={uId} value={uId}>
                            {u.name || u.email} {u.role ? `(${u.role})` : ''} - #{uId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* Initial Opportunity Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Opportunity Notes & Counseling Requirements
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="e.g. Inquired about UK Masters programs. Scheduled academic document assessment."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                  />
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
              disabled={creatingOpportunity}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-opportunity-form"
              variant="primary"
              size="md"
              loading={creatingOpportunity}
            >
              Create Opportunity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
