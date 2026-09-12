import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClient } from '../../../../actions/Admin/clientAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, UserPlus, AlertCircle, Mail, Calendar, Share2, Info } from 'lucide-react';

export default function ClientAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { adding } = useSelector((state) => state.client ?? {});

  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [dob, setDob]       = useState('');
  const [source, setSource] = useState('');
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setDob('');
    setSource('');
    setSubmitError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!name.trim())  { setSubmitError('Client Full Name is required.'); return; }
    if (!email.trim()) { setSubmitError('Client Email Address is required.'); return; }

    const res = await dispatch(addClient(name.trim(), email.trim(), dob.trim(), source.trim()));
    if (res?.success) {
      resetForm();
      onSuccess?.(`Client "${name.trim()}" created successfully!`);
      onClose();
    } else {
      setSubmitError(res?.error || 'Failed to create client.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-md w-full overflow-hidden"
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Create New Client / Student</h3>
              <p className={TYPOGRAPHY.caption}>Add client record to CRM</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {submitError && (
            <div className="flex gap-2.5 p-3 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
            style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Full Name and Email Address are required.</span>
          </div>

          {/* Name */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Client Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kasun Perera"
              value={name}
              onChange={(e) => { setName(e.target.value); setSubmitError(''); }}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Email */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Email Address <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <Mail style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="e.g. testemail@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubmitError(''); }}
                style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* DOB & Source Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>Date of Birth</label>
              <div className="relative">
                <Calendar style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>Lead Source</label>
              <div className="relative">
                <Share2 style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Website / Refer"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={adding}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={adding}>
              Create Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
