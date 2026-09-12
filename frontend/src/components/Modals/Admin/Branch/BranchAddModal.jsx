import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBranch } from '../../../../actions/Admin/branchAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, Building2, AlertCircle, MapPin, Phone, Info } from 'lucide-react';

// ── Maps raw API / network errors → user-friendly sentences ──
function friendlyError(raw) {
  if (!raw) return 'Something went wrong. Please try again.';

  const msg = String(raw);
  const lower = msg.toLowerCase();

  if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('unique'))
    return 'A branch with this name or phone already exists. Please use different details.';

  if (lower.includes('required') || lower.includes('missing'))
    return 'All fields are required. Please fill in Branch Name, Address, and Phone.';

  if (lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('401') || lower.includes('403'))
    return 'You do not have permission to perform this action.';

  if (lower.includes('connection') || lower.includes('econnrefused'))
    return 'Connection failed. Please check if the backend server is running.';

  if (msg.length < 150 && !lower.includes('<html') && !lower.includes('<!doctype')) {
    return msg;
  }

  return 'An error occurred while creating the branch. Please check server logs.';
}




export default function BranchAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { adding } = useSelector((state) => state.branch ?? {});

  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone]     = useState('');
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setSubmitError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Client-side validation
    if (!name.trim())    { setSubmitError('Branch Name is required.'); return; }
    if (!address.trim()) { setSubmitError('Branch Address is required.'); return; }
    if (!phone.trim())   { setSubmitError('Contact Phone is required.'); return; }

    const res = await dispatch(addBranch(name.trim(), address.trim(), phone.trim()));
    if (res?.success) {
      resetForm();
      onSuccess?.(`Branch "${name.trim()}" created successfully!`);
      onClose();
    } else {
      setSubmitError(friendlyError(res?.error));
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Create New Branch</h3>
              <p className={TYPOGRAPHY.caption}>Add a new branch office to CRM</p>
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

          {/* ── Error Banner ─────────────────────────────────── */}
          {submitError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                color: '#991B1B',
              }}
              className="flex gap-2.5 p-3 border rounded-xl text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-0.5">
                <p className="font-bold text-red-700">Unable to create branch</p>
                <p className="font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {/* ── Hint ─────────────────────────────────────────── */}
          <div
            style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.primaryBorder }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
            style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>All fields marked <strong>*</strong> are required. Each branch must have a unique name.</span>
          </div>

          {/* Branch Name */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Branch Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Colombo Head Office"
              value={name}
              onChange={(e) => { setName(e.target.value); setSubmitError(''); }}
              style={{
                backgroundColor: COLORS.background,
                borderColor: submitError && !name.trim() ? '#EF4444' : COLORS.border,
                color: COLORS.foreground,
              }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Address */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Branch Address <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <MapPin style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. No. 123, Galle Road, Colombo 03"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setSubmitError(''); }}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: submitError && !address.trim() ? '#EF4444' : COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Contact Phone <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <Phone style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. 0778962219 or +94 11 234 5678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSubmitError(''); }}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: submitError && !phone.trim() ? '#EF4444' : COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={adding}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={adding}>
              Create Branch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
