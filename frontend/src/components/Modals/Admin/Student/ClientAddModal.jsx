import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClient } from '../../../../actions/Admin/clientAction';
import {
  createOpportunityForStudent,
  fetchPipelineStatuses,
  fetchPipelineData,
} from '../../../../actions/Admin/pipelineAction';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import referrerService from '../../../../services/Admin/referrerService';
import useAuth from '../../../../hooks/Auth/useAuth';
import { getUserRole, isStaffUser } from '../../../../utils/roleUtils';
import { getStaffAssignmentQueue, advanceStaffQueue } from '../../../../utils/staffQueueUtils';
import Button from '../../../ui/Button';
import {
  X,
  AlertCircle,
  Mail,
  Calendar,
  Share2,
  Award,
  User,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

const getInitialStatusId = (statusesList) => {
  if (!statusesList || statusesList.length === 0) return 2;
  const hasId1 = statusesList.find((s) => s.status_id === 1);
  if (hasId1) return 1;
  const stage1 = statusesList.find((s) => s.stage_order === 1);
  return stage1?.status_id || statusesList[0]?.status_id || 2;
};

export default function ClientAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isStaff = userRole === 'STAFF';

  const { statuses = [], opportunities = [] } = useSelector((state) => state.pipeline ?? {});
  const { users: staffUsers = [] } = useSelector((state) => state.users ?? {});

  // Step 1: Student Information States
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [source, setSource] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [selectedReferrerId, setSelectedReferrerId] = useState('');

  // Step 2: Opportunity Setup States
  const [statusId, setStatusId] = useState(2);
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [note, setNote] = useState('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Filter active staff members for assignment
  const availableStaffUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      const isActive = !u.status || String(u.status).toUpperCase() === 'ACTIVE';
      return isActive && isStaffUser(u);
    });
  }, [staffUsers]);

  // Track queue updates across forms
  const [queueCounter, setQueueCounter] = useState(0);

  useEffect(() => {
    const handleQueueChange = () => setQueueCounter((prev) => prev + 1);
    window.addEventListener('edugate-staff-queue-changed', handleQueueChange);
    return () => window.removeEventListener('edugate-staff-queue-changed', handleQueueChange);
  }, []);

  // Compute staff queue order and recommended counselor (FIFO / Round-Robin)
  const { orderedStaff, recommendedStaff } = useMemo(() => {
    return getStaffAssignmentQueue(availableStaffUsers, opportunities);
  }, [availableStaffUsers, opportunities, queueCounter]);

  // Load referrers, pipeline statuses, and users when drawer opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLocalError('');

      referrerService
        .getAllReferrers()
        .then((res) => {
          const list = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
            ? res.data
            : [];
          setReferrers(list.filter((r) => (r.status || 'Active') === 'Active'));
        })
        .catch(() => setReferrers([]));

      if (statuses.length === 0) {
        dispatch(fetchPipelineStatuses());
      }
      if (staffUsers.length === 0) {
        dispatch(fetchUsers());
      }
    }
  }, [isOpen, dispatch, statuses.length, staffUsers.length]);

  // Sync initial status id when statuses load
  useEffect(() => {
    if (statuses.length > 0) {
      const currentValid = statuses.some((s) => s.status_id === Number(statusId));
      if (!currentValid) {
        setStatusId(getInitialStatusId(statuses));
      }
    }
  }, [statuses, statusId]);

  // Default counselor assignment if user is staff
  useEffect(() => {
    if (isStaff && user?.user_id) {
      setAssignedStaffId(String(user.user_id));
    }
  }, [isStaff, user?.user_id]);

  if (!isOpen) return null;

  const handleToggleChannel = (channelId) => {
    let nextChannels;
    if (selectedChannels.includes(channelId)) {
      nextChannels = selectedChannels.filter((id) => id !== channelId);
      if (channelId === 'Referee') {
        setSelectedReferrerId('');
      }
    } else {
      nextChannels = [...selectedChannels, channelId];
      if (channelId === 'Referee') {
        setSource('Referee');
      }
    }
    setSelectedChannels(nextChannels);
    if (!nextChannels.includes('Referee')) {
      setSource(nextChannels.join(', '));
    } else {
      setSource('Referee');
    }
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setEmail('');
    setDob('');
    setSource('');
    setSelectedChannels([]);
    setSelectedReferrerId('');
    setStatusId(getInitialStatusId(statuses));
    setAssignedStaffId(isStaff && user?.user_id ? String(user.user_id) : '');
    setNote('');
    setLocalError('');
    setSubmitting(false);
    onClose();
  };

  const selectedReferrer = referrers.find(
    (r) => String(r.referrer_id) === String(selectedReferrerId)
  );

  const finalSource = selectedChannels.includes('Referee')
    ? 'Referee'
    : source.trim() || 'Direct Contact';

  // Validate Step 1 before moving to Step 2
  const handleGoToStep2 = (e) => {
    if (e) e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Student Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email Address is required.');
      return;
    }
    if (selectedChannels.includes('Referee') && !selectedReferrerId) {
      setLocalError('Please select a Referee from the Referrers list.');
      return;
    }

    setStep(2);
  };

  const handleBackToStep1 = () => {
    setLocalError('');
    setStep(1);
  };

  // Submit both Student and Opportunity in one go
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');
    setSubmitting(true);

    try {
      // 1. Create Student record
      const clientRes = await dispatch(
        addClient(
          name.trim(),
          email.trim(),
          dob.trim(),
          finalSource,
          selectedReferrerId || null
        )
      );

      if (!clientRes?.success) {
        setLocalError(clientRes?.error || 'Failed to create student.');
        setSubmitting(false);
        return;
      }

      const createdClientId = clientRes.data?.client_id || clientRes.data?.id;

      if (!createdClientId) {
        setLocalError('Student record was created, but unable to retrieve Client ID for the opportunity.');
        setSubmitting(false);
        return;
      }

      // 2. Create Opportunity linked to the newly created student
      const oppPayload = {
        clientId: Number(createdClientId),
        client_id: Number(createdClientId),
        statusId: Number(statusId) || 1,
        status_id: Number(statusId) || 1,
        assignedStaffId: assignedStaffId ? Number(assignedStaffId) : null,
        assigned_staff_id: assignedStaffId ? Number(assignedStaffId) : null,
        note: note.trim() || undefined,
      };

      const oppRes = await dispatch(
        createOpportunityForStudent(oppPayload, {
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientSource: finalSource,
        })
      );

      if (!oppRes?.success) {
        setLocalError(
          `Student profile created, but creating opportunity failed: ${oppRes?.error || 'Unknown error'}`
        );
        setSubmitting(false);
        return;
      }

      // If counselor assigned, advance their turn in the round-robin queue
      if (assignedStaffId) {
        advanceStaffQueue(assignedStaffId);
      }

      // 3. Refresh full pipeline and notify parent
      dispatch(fetchPipelineData());
      handleClose();
      onSuccess?.(`Student "${name.trim()}" and pipeline opportunity created successfully!`);
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {step === 1 ? 'Add New Student / Client' : 'Create Opportunity'}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {step === 1
                  ? 'Register student profile, academic inquiries, and lead channel details'
                  : 'Convert student inquiry into an active pipeline opportunity'}
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

          {/* 2-Step Wizard Indicator with unified theme */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  step === 1 ? 'text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#1E3A8A] text-white"
                >
                  {step > 1 ? <Check className="w-3 h-3 text-white" /> : '1'}
                </span>
                <span>Student Details</span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  step === 2 ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === 2
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <span>Opportunity Setup</span>
              </div>
            </div>

            <span className="text-[11px] font-medium text-slate-500">
              Step {step} of 2
            </span>
          </div>

          {/* Drawer Body Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {localError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError}</span>
              </div>
            )}

            {/* STEP 1: Student Information Form */}
            {step === 1 && (
              <form id="student-step1-form" onSubmit={handleGoToStep2} className="space-y-6">
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="pb-2 border-b border-slate-200/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Student Information
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Core identity details and contact information
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Full Name <span className="text-rose-500">*</span>
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

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="e.g. kasun@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (localError) setLocalError('');
                        }}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Lead Source Multi-Select Channels (No colored dots) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Lead Source Channel(s)
                      </label>
                      {selectedChannels.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {selectedChannels.length} Selected
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                      {[
                        { id: 'Messenger', label: 'Messenger' },
                        { id: 'Whatsapp', label: 'WhatsApp' },
                        { id: 'Email', label: 'Email' },
                        { id: 'Messages & Calls', label: 'Messages & Calls' },
                        { id: 'Referee', label: 'Referees' },
                      ].map((ch) => {
                        const isSelected = selectedChannels.includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => handleToggleChannel(ch.id)}
                            className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate">{ch.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Referee Selector if Referees channel is selected */}
                    {selectedChannels.includes('Referee') && (
                      <div className="mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-slate-500" />
                            Select Referee / Referrer <span className="text-rose-500">*</span>
                          </label>
                        </div>

                        <select
                          value={selectedReferrerId}
                          onChange={(e) => setSelectedReferrerId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Referee from Referrers Page --</option>
                          {referrers.map((r) => (
                            <option key={r.referrer_id} value={r.referrer_id}>
                              {r.referrer_code} — {r.name} {r.phone_number ? `(${r.phone_number})` : ''}
                            </option>
                          ))}
                        </select>

                        {selectedReferrer && (
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {selectedReferrer.name ? selectedReferrer.name.charAt(0).toUpperCase() : 'R'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{selectedReferrer.name}</p>
                                <p className="font-mono text-[10px] text-slate-500 font-semibold">{selectedReferrer.referrer_code}</p>
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-slate-600">
                              {selectedReferrer.phone_number && <p className="font-medium">{selectedReferrer.phone_number}</p>}
                              {selectedReferrer.email && <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{selectedReferrer.email}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="relative">
                      <Share2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Referee, Messenger, or Custom Lead Source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: Opportunity Setup Form */}
            {step === 2 && (
              <form id="student-step2-form" onSubmit={handleSubmit} className="space-y-6">
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
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      New Profile
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                        Student Full Name
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{name}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                          Email Address
                        </span>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{email}</span>
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                          Lead Source
                        </span>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{finalSource}</span>
                        </p>
                      </div>
                    </div>
                  </div>
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Assign Staff Counselor (Optional)
                        </label>
                      </div>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <select
                          value={assignedStaffId}
                          onChange={(e) => setAssignedStaffId(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                        >
                          <option value="">-- Unassigned (General Pool) --</option>
                          {orderedStaff.map((u) => {
                            const uId = u.user_id || u.id;
                            const isRecommended =
                              recommendedStaff &&
                              String(recommendedStaff.user_id || recommendedStaff.id) === String(uId);
                            return (
                              <option key={uId} value={uId}>
                                {u.name || u.email} #{uId} {isRecommended ? '— Recommended (Next in Queue)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Clean Professional Recommendation Label (No Background Color) */}
                      {recommendedStaff && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-0.5">
                          <span className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">Recommended:</span>
                            <span className="text-slate-900 font-medium">
                              {recommendedStaff.name || recommendedStaff.email}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              (Next in assignment queue)
                            </span>
                          </span>
                          {String(assignedStaffId) !== String(recommendedStaff.user_id || recommendedStaff.id) && (
                            <button
                              type="button"
                              onClick={() =>
                                setAssignedStaffId(String(recommendedStaff.user_id || recommendedStaff.id))
                              }
                              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                            >
                              Select Recommended
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opportunity Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Opportunity Notes & Counseling Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Inquired about UK Masters programs. Scheduled academic document assessment."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-2xs resize-none"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Drawer Footer Actions with White Next Button */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  form="student-step1-form"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
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
                    form="student-step2-form"
                    variant="primary"
                    size="md"
                    loading={submitting}
                  >
                    Create Opportunity
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
