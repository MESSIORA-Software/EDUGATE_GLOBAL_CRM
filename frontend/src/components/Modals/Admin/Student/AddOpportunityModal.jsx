import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Mail,
  Calendar,
  User,
  Layers,
  UserCheck,
  FileText,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
} from 'lucide-react';
import conversationService from '../../../../services/Conversation/conversationService';
import userService from '../../../../services/Admin/userService';

const CHANNEL_OPTIONS = [
  {
    id: 'Whatsapp',
    label: 'WhatsApp',
    color: 'bg-emerald-600 text-white border-emerald-600',
    unselected: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  {
    id: 'Email',
    label: 'Email',
    color: 'bg-violet-600 text-white border-violet-600',
    unselected: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  },
  {
    id: 'Messenger',
    label: 'Messenger',
    color: 'bg-blue-600 text-white border-blue-600',
    unselected: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  {
    id: 'Messages & Phone calls',
    label: 'Messages & Calls',
    color: 'bg-rose-600 text-white border-rose-600',
    unselected: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  },
];

export default function AddOpportunityModal({
  isOpen,
  onClose,
  conversation,
  activeChannel = 'email',
  onSuccess,
}) {
  // 1. Student / Client Details state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);

  // 2. Opportunity Details state
  const [statusId, setStatusId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [note, setNote] = useState('');

  // Dropdown lists
  const [statuses, setStatuses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill and load options when modal opens
  useEffect(() => {
    if (!isOpen || !conversation) return;

    setError('');
    const client = conversation.clients || {};

    // 1. Auto-fill Client Name from contact
    const contactName = client.name || conversation.channel_client_id || '';
    setName(contactName);

    // 2. Auto-fill Email Address if email conversation or client email exists
    if (conversation.channel === 'email') {
      setEmail(conversation.channel_client_id || client.email || '');
    } else {
      setEmail(client.email || '');
    }

    // 3. Date of Birth
    setDob(client.dob ? client.dob.substring(0, 10) : '');

    // 4. Auto-complete Lead Source with the open conversation platform
    let initialChannel = 'Email';
    if (conversation.channel === 'whatsapp') initialChannel = 'Whatsapp';
    else if (conversation.channel === 'messenger') initialChannel = 'Messenger';
    else if (conversation.channel === 'sms' || conversation.channel === 'call') initialChannel = 'Messages & Phone calls';
    else if (conversation.channel === 'email') initialChannel = 'Email';

    setSelectedChannels([initialChannel]);

    // Opportunity state
    setAssignedStaffId(conversation.assigned_staff_id || '');
    setNote('');

    // Fetch pipeline statuses and staff users (role = STAFF)
    setLoadingOptions(true);
    Promise.all([
      conversationService.getOpportunityStatuses().catch(() => null),
      conversationService.getUsersByRole('STAFF').catch(() => null),
      userService.getUsersByRole('STAFF').catch(() => null),
    ])
      .then(([statusRes, userRes, userFallbackRes]) => {
        const statusData = statusRes?.data?.data || statusRes?.data || [];
        const rawStatuses = Array.isArray(statusData) ? statusData : [];
        setStatuses(rawStatuses);

        if (rawStatuses.length > 0) {
          const firstStage = rawStatuses.find((s) => s.stage_order === 1) || rawStatuses[0];
          setStatusId(firstStage.status_id);
        }

        const userData = userRes?.data?.data || userRes?.data || userFallbackRes?.data || userFallbackRes || [];
        const rawUsers = Array.isArray(userData) ? userData : [];
        // Only allow users whose role is STAFF
        const staffOnly = rawUsers.filter((u) => String(u.role_id || u.role || '').toUpperCase() === 'STAFF');
        setStaffList(staffOnly);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, [isOpen, conversation, activeChannel]);

  if (!isOpen || !conversation) return null;

  const toggleChannel = (channelId) => {
    if (selectedChannels.includes(channelId)) {
      if (selectedChannels.length === 1) return; // Keep at least one channel selected
      setSelectedChannels(selectedChannels.filter((id) => id !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Client Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email Address is required.');
      return;
    }
    if (!statusId) {
      setError('Please select an Opportunity Status.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        dob: dob || null,
        source: selectedChannels.join(', ') || conversation.channel.toUpperCase(),
        status_id: Number(statusId),
        assigned_staff_id: assignedStaffId ? Number(assignedStaffId) : null,
        note: note.trim(),
      };

      const response = await conversationService.createOpportunityFromConversation(
        conversation.conversation_id,
        payload
      );

      const clientName = response?.data?.data?.client?.name || name;
      onSuccess?.(`Opportunity created for "${clientName}" successfully! Visible in Students & Pipeline.`, response?.data?.data);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create opportunity.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Opportunity</h2>
              <p className="text-xs text-slate-500">
                Register student and create an active opportunity in the pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Student / Client Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Student / Client Information
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Client Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    required
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lead Source (Select Channel(s)) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lead Source (Select Channel(s))
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CHANNEL_OPTIONS.map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition ${
                          isSelected ? ch.color : ch.unselected
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-400'}`} />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Opportunity Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Opportunity Details
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Opportunity Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opportunity Status <span className="text-red-500">*</span>
                </label>
                {loadingOptions ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    Loading pipeline statuses...
                  </div>
                ) : (
                  <select
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    {statuses.map((s) => (
                      <option key={s.status_id} value={s.status_id}>
                        {s.status_name} (Stage {s.stage_order || 1})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assign Staff Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Staff Member
                </label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Unassigned</option>
                  {staffList.map((user) => {
                    const uId = user.user_id || user.id;
                    return (
                      <option key={uId} value={uId}>
                        {user.name || user.email || `Staff #${uId}`} {user.email && user.name ? `(${user.email})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Initial Opportunity Note */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Opportunity Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="2"
                  placeholder="Enter initial inquiry details, degree interest, or notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Creating Opportunity...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Create Opportunity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
