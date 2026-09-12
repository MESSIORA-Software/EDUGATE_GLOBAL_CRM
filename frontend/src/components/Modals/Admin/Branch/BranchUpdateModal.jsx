import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBranch } from '../../../../actions/Admin/branchAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, Edit3, AlertCircle, MapPin, Phone, Info } from 'lucide-react';

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

  return 'An error occurred while updating the branch. Please check server logs.';
}




export default function BranchUpdateModal({ isOpen, branch, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { updating } = useSelector((state) => state.branch ?? {});

  const [branchId, setBranchId] = useState('');
  const [name, setName]         = useState('');
  const [address, setAddress]   = useState('');
  const [phone, setPhone]       = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (branch) {
      setBranchId(branch.branch_id ?? branch.id ?? '');
      setName(branch.name ?? '');
      setAddress(branch.address ?? '');
      setPhone(branch.phone ?? '');
      setSubmitError('');
    }
  }, [branch]);

  if (!isOpen || !branch) return null;

  const handleClose = () => {
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Client-side validation
    if (!name.trim())    { setSubmitError('Branch Name is required.'); return; }
    if (!address.trim()) { setSubmitError('Branch Address is required.'); return; }
    if (!phone.trim())   { setSubmitError('Contact Phone is required.'); return; }

    const res = await dispatch(
      updateBranch(Number(branchId) || branchId, name.trim(), address.trim(), phone.trim())
    );

    if (res?.success) {
      onSuccess?.(`Branch #${branchId} updated successfully!`);
      handleClose();
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
              style={{ backgroundColor: '#FEF3C7', color: COLORS.warning }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Update Branch Details</h3>
              <p className={TYPOGRAPHY.caption}>
                Editing Branch{' '}
                <span
                  style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                  className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border border-blue-200"
                >
                  #{branchId}
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

          {/* ── Error Banner ─────────────────────────────────── */}
          {submitError && (
            <div
              className="flex gap-2.5 p-3 border rounded-xl text-xs leading-relaxed"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-0.5">
                <p className="font-bold text-red-700">Unable to update branch</p>
                <p className="font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {/* ── Hint ─────────────────────────────────────────── */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
            style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Branch ID cannot be changed. Update any other detail below.</span>
          </div>

          {/* Branch ID — read-only */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Branch ID (Read-only)</label>
            <input
              type="text"
              value={`#${branchId}`}
              disabled
              style={{
                backgroundColor: '#F1F5F9',
                borderColor: COLORS.border,
                color: COLORS.placeholder,
              }}
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold cursor-not-allowed"
            />
          </div>

          {/* Branch Name */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Branch Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kandy Branch"
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
                placeholder="e.g. No. 45, Peradeniya Road, Kandy"
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
                placeholder="e.g. 0778962219"
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
