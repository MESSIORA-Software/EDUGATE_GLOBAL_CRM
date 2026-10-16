import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOpportunityForStudent, fetchPipelineStatuses } from '../../../../actions/Admin/pipelineAction';
import { fetchClients } from '../../../../actions/Admin/clientAction';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import {
  X,
  Target,
  User,
  Layers,
  AlertCircle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

const getInitialStatusId = (statusesList) => {
  if (!statusesList || statusesList.length === 0) return 2;
  const hasId1 = statusesList.find((s) => s.status_id === 1);
  if (hasId1) return 1;
  const stage1 = statusesList.find((s) => s.stage_order === 1);
  return stage1?.status_id || statusesList[0]?.status_id || 2;
};

export default function CreateOpportunityModal({ isOpen, client, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const { statuses = [], opportunities = [], creatingOpportunity = false } = useSelector((state) => state.pipeline ?? {});
  const { list: registeredClients = [] } = useSelector((state) => state.client ?? {});
  const { users: staffUsers = [] } = useSelector((state) => state.users ?? {});

  const existingOppClientIds = React.useMemo(() => {
    return new Set(opportunities.map((o) => Number(o.client_id)));
  }, [opportunities]);

  const availableClients = React.useMemo(() => {
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

      const initialClientId = client?.client_id || client?.id || '';
      setSelectedClientId(initialClientId);
      setStatusId(getInitialStatusId(statuses));
      setAssignedStaffId('');
      setNote('');
      setSubmitError('');
    }
  }, [isOpen, client, dispatch, statuses]);

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
    registeredClients.find((c) => String(c.client_id || c.id) === String(selectedClientId));

  const effectiveClientId = currentClient?.client_id || currentClient?.id || selectedClientId;
  const clientName = currentClient?.name || 'Selected Student';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!effectiveClientId) {
      setSubmitError('Please select a student / client.');
      return;
    }

    if (existingOppClientIds.has(Number(effectiveClientId))) {
      setSubmitError('This student already has an active opportunity in the pipeline.');
      return;
    }

    const res = await dispatch(
      createOpportunityForStudent({
        clientId: Number(effectiveClientId),
        assignedStaffId: assignedStaffId || null,
        statusId: Number(statusId) || 1,
        note: note.trim(),
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
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <Target className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Add as Opportunity</h3>
              <p className={TYPOGRAPHY.caption}>Convert student into an active pipeline opportunity</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {submitError && (
            <div className="flex gap-2.5 p-3 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Student Selector or Summary */}
          {client ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{client.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {client.email || 'No email'} {client.source ? `• ${client.source}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                #{client.client_id || client.id}
              </span>
            </div>
          ) : (
            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>
                Select Student / Client <span style={{ color: COLORS.secondary }}>*</span>
              </label>
              <div className="relative">
                <UserCheck style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  style={{
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.border,
                    color: COLORS.foreground,
                  }}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
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

          {/* Opportunity Status (Default 1) */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Opportunity Status <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <Layers style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <select
                value={statusId}
                onChange={(e) => setStatusId(Number(e.target.value))}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {statuses.length > 0 ? (
                  statuses.map((s) => (
                    <option key={s.status_id} value={s.status_id}>
                      {s.status_name} (Status ID: {s.status_id})
                    </option>
                  ))
                ) : (
                  <option value={1}>Default Stage (Status ID: 1)</option>
                )}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Status defaults to ID: 1 as specified in API specifications.
            </p>
          </div>

          {/* Assign Staff */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Assign Staff Member</label>
            <div className="relative">
              <User style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="">-- Unassigned (None) --</option>
                {staffUsers.map((u) => {
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

          {/* Add Opportunity Note */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Initial Opportunity Note</label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g. Inquired about Software Engineering intake. Follow-up consultation scheduled."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={creatingOpportunity}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creatingOpportunity} icon={CheckCircle2}>
              Create Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
