import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Type, AlignLeft, User, AlertCircle, Loader2 } from 'lucide-react';
import StaffPicker from './StaffPicker';
import TimePicker from './TimePicker';
import { formatEventId } from '../../../../hooks/Admin/Event/useEvent';

export default function EventUpdateModal({ isOpen, event, onClose, onSuccess, handleUpdateEvent, submitting }) {
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    event_date: '',
    start_time: '',
    end_time: '',
    assigned_staff_id: '',
    client_id: '',
  });

  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || '',
        reason: event.reason || '',
        event_date: event.event_date || '',
        start_time: event.start_time ? event.start_time.substring(0, 5) : '',
        end_time: event.end_time ? event.end_time.substring(0, 5) : '',
        assigned_staff_id: event.assigned_staff_id || '',
        client_id: event.client_id || '',
      });
      setErrors({});
      setLocalError('');
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (localError) setLocalError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.reason.trim()) newErrors.reason = 'Event description / reason is required';
    if (!formData.event_date) newErrors.event_date = 'Event date is required';
    return newErrors;
  };

  const handleClose = () => {
    setErrors({});
    setLocalError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = { ...formData };
    if (!payload.start_time) payload.start_time = null;
    if (!payload.end_time) payload.end_time = null;
    if (!payload.assigned_staff_id) payload.assigned_staff_id = null;
    if (!payload.client_id) payload.client_id = null;

    try {
      const res = await handleUpdateEvent(event.event_id, payload);
      if (res?.success) {
        handleClose();
        onSuccess?.('Event updated successfully!');
      } else if (res?.error) {
        setLocalError(res.error);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to update event.');
    }
  };

  const formattedId = formatEventId(event.event_id);

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={submitting ? undefined : handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Edit Event
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {formattedId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Update scheduled details, date, times, and participants
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Form Body */}
          <form id="update-event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {localError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError}</span>
              </div>
            )}

            {/* Event Details & Schedule Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Event Details & Schedule
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update event title, reason, date, and time range
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Type className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="E.g. Visa Consultation Meeting"
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all ${
                      errors.title ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.title && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.title}</p>}
              </div>

              {/* Reason / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason / Description <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <AlignLeft className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={submitting}
                    rows={3}
                    placeholder="Provide details and purpose of this scheduled event..."
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none ${
                      errors.reason ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.reason && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.reason}</p>}
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      disabled={submitting}
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all ${
                        errors.event_date ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.event_date && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.event_date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Start Time
                  </label>
                  <TimePicker
                    value={formData.start_time}
                    onChange={(val) => setFormData((prev) => ({ ...prev, start_time: val }))}
                    placeholder="Start time"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    End Time
                  </label>
                  <TimePicker
                    value={formData.end_time}
                    onChange={(val) => setFormData((prev) => ({ ...prev, end_time: val }))}
                    minTime={formData.start_time}
                    placeholder="End time"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Assignments Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Staff & Participant Assignment
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update staff assignment for this scheduled event
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Staff Member
                </label>
                <StaffPicker
                  value={formData.assigned_staff_id}
                  onChange={(val) => setFormData((prev) => ({ ...prev, assigned_staff_id: val }))}
                  disabled={submitting}
                />
              </div>
            </div>
          </form>

          {/* Drawer Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="update-event-form"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
