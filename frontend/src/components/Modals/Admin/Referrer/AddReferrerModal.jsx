import React, { useState, useEffect } from 'react';
import ReferrerService from '../../../../services/Admin/referrerService';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import {
  X,
  UserPlus,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function AddReferrerModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');

  const [nextCode, setNextCode] = useState('EDUGATE_REFERRER_01');
  const [fetchingCode, setFetchingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setHomeAddress('');
      setWhatsappNumber('');
      setPhoneNumber('');
      setNote('');
      setError('');

      setFetchingCode(true);
      ReferrerService.getNextCode()
        .then((res) => {
          if (res?.data?.data?.next_code) {
            setNextCode(res.data.data.next_code);
          }
        })
        .catch(() => {
          setNextCode('EDUGATE_REFERRER_01');
        })
        .finally(() => {
          setFetchingCode(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Referrer Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await ReferrerService.createReferrer({
        name: name.trim(),
        email: email.trim() || null,
        home_address: homeAddress.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        phone_number: phoneNumber.trim() || null,
        note: note.trim() || null,
      });

      const createdCode = res?.data?.data?.referrer_code || nextCode;
      onSuccess?.(`Referrer "${name.trim()}" added successfully with ID ${createdCode}!`);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to create referrer. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all duration-300 animate-in fade-in">
      <div className="rounded-2xl shadow-2xl border border-slate-200/90 bg-white max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all duration-300 ease-out animate-in zoom-in-95">
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs transition-transform duration-200 hover:scale-105"
            >
              <UserPlus className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Add New Referrer</h3>
              <p className={TYPOGRAPHY.caption}>Register a referral partner with a unique ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Clean Referrer ID Bar */}
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between transition-all duration-200">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Referrer ID
            </span>
            <span className="font-mono text-xs font-bold text-blue-900 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs tracking-wider">
              {fetchingCode ? 'Generating ID...' : nextCode}
            </span>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Referrer Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe / Samantha Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                placeholder="referrer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200"
              />
            </div>
          </div>

          {/* Contact Numbers Row: Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">WhatsApp Number</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+94 77 987 6543"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Home Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Home Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 124 Galle Road, Colombo 03, Sri Lanka"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Notes / Partnership Details</label>
            <textarea
              rows={3}
              placeholder="e.g. Overseas education consultant agent, 10% referral commission agreement."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 hover:border-slate-300 transition-all duration-200 resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-[0.98] border border-slate-200 transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Referrer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
