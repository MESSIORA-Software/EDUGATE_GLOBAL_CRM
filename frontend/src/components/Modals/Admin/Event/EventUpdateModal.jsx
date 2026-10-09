import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Type, AlignLeft, User, UserCheck, Edit3 } from 'lucide-react';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';

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
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (!formData.event_date) newErrors.event_date = 'Date is required';
    return newErrors;
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

    await handleUpdateEvent(event.event_id, payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: COLORS.warningLight || '#FEF3C7', color: COLORS.warning || '#D97706' }}
            >
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={TYPOGRAPHY.h3} style={{ color: COLORS.foreground }}>
                Edit Event
              </h2>
              <p className={TYPOGRAPHY.label} style={{ color: COLORS.muted }}>
                Update details for #{event.event_id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: COLORS.muted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <form id="update-event-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                Event Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Type style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g. Strategy Meeting"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all ${
                    errors.title ? 'border-red-300 bg-red-50' : ''
                  }`}
                  style={!errors.title ? { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground } : {}}
                />
              </div>
              {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title}</p>}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                Reason / Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AlignLeft style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Why are we meeting?"
                  rows={3}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all ${
                    errors.reason ? 'border-red-300 bg-red-50' : ''
                  }`}
                  style={!errors.reason ? { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground } : {}}
                />
              </div>
              {errors.reason && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.reason}</p>}
            </div>

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all ${
                      errors.event_date ? 'border-red-300 bg-red-50' : ''
                    }`}
                    style={!errors.event_date ? { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground } : {}}
                  />
                </div>
                {errors.event_date && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.event_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                  Start Time
                </label>
                <div className="relative">
                  <Clock style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                  End Time
                </label>
                <div className="relative">
                  <Clock style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  />
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                  Assign to Staff (ID)
                </label>
                <div className="relative">
                  <User style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="assigned_staff_id"
                    value={formData.assigned_staff_id}
                    onChange={handleChange}
                    placeholder="Staff User ID"
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: COLORS.foreground }}>
                  Link to Client (ID)
                </label>
                <div className="relative">
                  <UserCheck style={{ color: COLORS.placeholder }} className="w-4 h-4 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    placeholder="Client ID"
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t flex justify-end gap-2" style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="update-event-form" disabled={submitting}>
            {submitting ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
