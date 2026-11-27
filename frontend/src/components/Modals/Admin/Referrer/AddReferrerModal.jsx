import React, { useState, useEffect } from 'react';
import ReferrerService from '../../../../services/Admin/referrerService';
import {
  X,
  Plus,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
  FileText,
  Copy,
  Check,
  Share2,
  CheckCircle2,
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

  // Post-creation share view state
  const [createdReferrer, setCreatedReferrer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setHomeAddress('');
      setWhatsappNumber('');
      setPhoneNumber('');
      setNote('');
      setError('');
      setCreatedReferrer(null);
      setCopiedId(null);
      setCopyFeedback('');

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

  const handleClose = () => {
    setName('');
    setEmail('');
    setHomeAddress('');
    setWhatsappNumber('');
    setPhoneNumber('');
    setNote('');
    setError('');
    setCreatedReferrer(null);
    setCopiedId(null);
    setCopyFeedback('');
    onClose();
  };

  const handleCopy = (text, id, msg = 'Copied to clipboard!') => {
    if (!text) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
        } catch (_) {}
        document.body.removeChild(textarea);
      });
    }
    setCopiedId(id);
    setCopyFeedback(msg);
    setTimeout(() => {
      setCopiedId(null);
      setCopyFeedback('');
    }, 2500);
  };

  const handleShare = async () => {
    if (!createdReferrer) return;
    const link = `${window.location.origin}/register?ref=${encodeURIComponent(createdReferrer.code)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Referral Link',
          text: 'Use my referral link to register.',
          url: link,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy(link, 'share', 'Referral link copied. You can now share it.');
        }
      }
    } else {
      handleCopy(link, 'share', 'Referral link copied. You can now share it.');
    }
  };

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

      const finalCode = res?.data?.data?.referrer_code || nextCode;
      setCreatedReferrer({
        name: name.trim(),
        code: finalCode,
      });
      onSuccess?.(`Referrer "${name.trim()}" created successfully with code ${finalCode}!`);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to create referrer. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const referralLink = createdReferrer
    ? `${window.location.origin}/register?ref=${encodeURIComponent(createdReferrer.code)}`
    : '';

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
          {/* Drawer Header without icon box */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {createdReferrer ? 'Referrer Created Successfully' : 'Add New Referrer'}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {createdReferrer
                  ? 'Referral code and registration link are ready to share'
                  : 'Register a referral partner with a unique system ID and partnership details'}
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

          {createdReferrer ? (
            /* Success & Referral Code / Link Distribution View */
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/50">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Success Banner */}
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Referrer created successfully! Referral code and link are active and ready to share.</span>
                </div>

                {/* Real-time Copy Feedback Alert */}
                {copyFeedback && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-medium animate-in fade-in">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{copyFeedback}</span>
                  </div>
                )}

                {/* Referrer & Code Distribution Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  {/* Referrer Partner Name */}
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Referrer Partner
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {createdReferrer.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Referral Code Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Referral Code
                    </label>
                    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/90 rounded-xl p-3 group hover:border-blue-300 transition-colors">
                      <span className="font-mono text-base font-bold text-blue-900 tracking-wider">
                        {createdReferrer.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdReferrer.code, 'code', 'Referral code copied!')}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100/70 rounded-lg transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedId === 'code' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Referral Link Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Referral Link
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 gap-2 group hover:border-slate-300 transition-colors">
                      <span className="font-mono text-xs text-slate-700 break-all select-all">
                        {referralLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(referralLink, 'link', 'Referral link copied!')}
                        className="shrink-0 p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                        title="Copy Referral Link"
                      >
                        {copiedId === 'link' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons: [ Copy Code ] [ Copy Link ] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(createdReferrer.code, 'code', 'Referral code copied!')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                    >
                      {copiedId === 'code' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Code</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(referralLink, 'link', 'Referral link copied!')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                    >
                      {copiedId === 'link' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Primary Share Action: [ Share Referral Link ] */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copiedId === 'share' ? 'Link Copied! Ready to share' : 'Share Referral Link'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center pt-1">
                    Share this referral link with prospective students or partners to automatically attribute registrations.
                  </p>
                </div>
              </div>

              {/* Drawer Footer with Done Action */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Partner Information */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-500" />
                      Partner Profile
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400">Required</span>
                  </div>

                  {/* Referrer Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 block">
                      Referrer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Global Education Partner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>

                  {/* System Referrer ID Indicator */}
                  <div className="p-3 bg-blue-50/40 border border-blue-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                        Assigned Referral Code
                      </span>
                      <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                        {fetchingCode ? 'Generating unique code...' : nextCode}
                      </p>
                    </div>
                    <span className="text-[10px] bg-blue-100/70 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                      Auto-generated
                    </span>
                  </div>
                </div>

                {/* Contact & Address Details */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      Contact Information
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400">Optional</span>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="partner@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="+94 77 123 4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="+94 77 123 4567"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Home / Office Address
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="No. 12, Galle Road, Colombo"
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
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
                    <span className="text-[11px] font-medium text-slate-400">Optional</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Overseas education consultant agent, student referral partnership."
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
                  onClick={handleClose}
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
                      <span>Saving Referrer...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Referrer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
