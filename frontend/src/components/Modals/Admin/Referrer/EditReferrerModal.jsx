import React, { useState, useEffect } from 'react';
import ReferrerService from '../../../../services/Admin/referrerService';
import {
  X,
  Edit2,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
  FileText,
  Check,
  ChevronDown,
} from 'lucide-react';

export default function EditReferrerModal({ isOpen, referrer, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Active');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && referrer) {
      setName(referrer.name || '');
      setEmail(referrer.email || '');
      setHomeAddress(referrer.home_address || '');
      setWhatsappNumber(referrer.whatsapp_number || '');
      setPhoneNumber(referrer.phone_number || '');
      setNote(referrer.note || '');
      setStatus(referrer.status || 'Active');
      setError('');
    }
  }, [isOpen, referrer]);

  if (!isOpen || !referrer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Referrer Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await ReferrerService.updateReferrer(referrer.referrer_id, {
        name: name.trim(),
        email: email.trim() || null,
        home_address: homeAddress.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        phone_number: phoneNumber.trim() || null,
        note: note.trim() || null,
        status,
      });

      onSuccess?.(`Referrer "${name.trim()}" updated successfully!`);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to update referrer. Please try again.'
      );
    } finally {
      setSubmitting(false);
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
          {/* Drawer Header without icon box */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Edit Referrer
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Update partner information, status, and partnership terms
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Referrer System ID Indicator */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Referrer Unique Code
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50/70 border border-blue-200/80 px-3 py-1 rounded-lg shadow-2xs tracking-wider">
                    {referrer.referrer_code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Unique system identifier assigned to this partner.
                </p>
              </div>

              {/* Basic Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Partner Information
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">Identity & Status</span>
                </div>

                {/* Referrer Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>
                      Full Name <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Account Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="appearance-none w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white cursor-pointer"
                    >
                      <option value="Active">Active Partner</option>
                      <option value="Inactive">Inactive Partner</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="referrer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Contact Numbers: Phone & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+94 77 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">WhatsApp Number</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+94 77 987 6543"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Home Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Home / Office Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 124 Galle Road, Colombo 03, Sri Lanka"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Agreement Details */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Notes & Partnership Agreement
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">Terms & History</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Overseas education consultant agent, 10% referral commission agreement."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none bg-white"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
