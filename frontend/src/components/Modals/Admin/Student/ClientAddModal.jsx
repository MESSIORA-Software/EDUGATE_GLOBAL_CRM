import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addClient } from '../../../../actions/Admin/clientAction';
import referrerService from '../../../../services/Admin/referrerService';
import Button from '../../../ui/Button';
import { X, AlertCircle, Mail, Calendar, Share2, Award, UserCheck, Phone } from 'lucide-react';

export default function ClientAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { adding } = useSelector((state) => state.client ?? {});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [source, setSource] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [selectedReferrerId, setSelectedReferrerId] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

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
    setName('');
    setEmail('');
    setDob('');
    setSource('');
    setSelectedChannels([]);
    setSelectedReferrerId('');
    setLocalError('');
    onClose();
  };

  const selectedReferrer = referrers.find(
    (r) => String(r.referrer_id) === String(selectedReferrerId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Student Name is required.');
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

    const finalSource = selectedChannels.includes('Referee')
      ? 'Referee'
      : source.trim();

    const res = await dispatch(
      addClient(
        name.trim(),
        email.trim(),
        dob.trim(),
        finalSource,
        selectedReferrerId || null
      )
    );
    if (res?.success) {
      handleClose();
      onSuccess?.(`Student '${name.trim()}' created successfully!`);
    } else {
      setLocalError(res?.error || 'Failed to create student.');
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop (sidebar remains fully available and interactive) */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header without icon */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Add New Student / Client
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Register student profile, academic inquiries, and lead channel details
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

          {/* Drawer Body Form */}
          <form id="student-add-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {localError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError}</span>
              </div>
            )}

            {/* Student Profile Card */}
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

              {/* Lead Source Multi-Select Channels */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Lead Source Channel(s)
                  </label>
                  {selectedChannels.length > 0 && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {selectedChannels.length} Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                  {[
                    { id: 'Messenger', label: 'Messenger', dot: 'bg-blue-600' },
                    { id: 'Whatsapp', label: 'WhatsApp', dot: 'bg-emerald-600' },
                    { id: 'Email', label: 'Email', dot: 'bg-purple-600' },
                    { id: 'Messages & Calls', label: 'Messages & Calls', dot: 'bg-rose-600' },
                    { id: 'Referee', label: 'Referees', dot: 'bg-amber-500' },
                  ].map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleToggleChannel(ch.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${ch.dot}`} />
                        <span className="truncate">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Referee Selector if Referees channel is selected */}
                {selectedChannels.includes('Referee') && (
                  <div className="mb-3 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" />
                        Select Referee / Referrer <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                        10 Pts Per Student
                      </span>
                    </div>

                    <select
                      value={selectedReferrerId}
                      onChange={(e) => setSelectedReferrerId(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Referee from Referrers Page --</option>
                      {referrers.map((r) => (
                        <option key={r.referrer_id} value={r.referrer_id}>
                          {r.referrer_code} — {r.name} {r.phone_number ? `(${r.phone_number})` : ''}
                        </option>
                      ))}
                    </select>

                    {selectedReferrer && (
                      <div className="p-2.5 bg-white border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {selectedReferrer.name ? selectedReferrer.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{selectedReferrer.name}</p>
                            <p className="font-mono text-[10px] text-blue-700 font-semibold">{selectedReferrer.referrer_code}</p>
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

          {/* Drawer Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="student-add-form"
              variant="primary"
              size="md"
              loading={adding}
            >
              Create Student
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
