import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateClient } from '../../../../actions/Admin/clientAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, Edit3, AlertCircle, Mail, Calendar, Share2, Info } from 'lucide-react';

export default function ClientUpdateModal({ isOpen, client, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { updating } = useSelector((state) => state.client ?? {});

  const [clientId, setClientId] = useState('');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [dob, setDob]           = useState('');
  const [source, setSource]     = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (client) {
      setClientId(client.client_id ?? client.id ?? '');
      setName(client.name ?? '');
      setEmail(client.email ?? '');
      setDob(client.dob ?? '');
      setSource(client.source ?? '');
      setSubmitError('');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleClose = () => {
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!name.trim())  { setSubmitError('Client Name is required.'); return; }
    if (!email.trim()) { setSubmitError('Client Email is required.'); return; }

    const res = await dispatch(
      updateClient(Number(clientId) || clientId, name.trim(), email.trim(), dob.trim(), source.trim())
    );

    if (res?.success) {
      onSuccess?.(`Client #${clientId} updated successfully!`);
      handleClose();
    } else {
      setSubmitError(res?.error || 'Failed to update client.');
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
              style={{ backgroundColor: '#FEF3C7', color: COLORS.warning }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Update Client / Student</h3>
              <p className={TYPOGRAPHY.caption}>
                Editing Client{' '}
                <span
                  style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                  className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border border-blue-200"
                >
                  #{clientId}
                </span>
              </p>
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
            style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Client ID cannot be changed. Update details below.</span>
          </div>

          {/* Client ID */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Client ID (Read-only)</label>
            <input
              type="text"
              value={`#${clientId}`}
              disabled
              style={{ backgroundColor: '#F1F5F9', borderColor: COLORS.border, color: COLORS.placeholder }}
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold cursor-not-allowed"
            />
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
                  placeholder="e.g. Website"
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
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={updating}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
