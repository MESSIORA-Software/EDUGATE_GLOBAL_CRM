import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBranch } from '../../../../actions/Admin/branchAction';
import Button from '../../../ui/Button';
import { X, AlertCircle } from 'lucide-react';

export default function BranchAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { adding } = useSelector((state) => state.branch ?? {});

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Auto-generate formatted branch ID from name with EDUGATE_ prefix
  const getGeneratedId = (inputName) => {
    let clean = (inputName || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!clean) return 'EDUGATE_BRANCH';
    return clean.startsWith('EDUGATE_') ? clean : `EDUGATE_${clean}`;
  };

  const branchId = getGeneratedId(name);

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setStatus('Active');
    setSubmitError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setSubmitError('Branch Name is required.');
      return;
    }
    if (!trimmedAddress) {
      setSubmitError('Branch Address is required.');
      return;
    }
    if (!trimmedPhone) {
      setSubmitError('Contact Phone is required.');
      return;
    }

    const res = await dispatch(addBranch(trimmedName, trimmedAddress, trimmedPhone, status));
    if (res?.success) {
      resetForm();
      onSuccess?.(`Branch "${trimmedName}" created successfully!`);
      onClose();
    } else {
      setSubmitError(res?.error || 'Failed to create branch.');
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
                Add New Branch
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Set up a new branch location, contact details, and status
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
          <form id="branch-add-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Branch Identity Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Branch Information
                </h3>
              </div>

              {/* Branch Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo Central"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Auto-Generated Branch ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Branch ID
                  </label>
                  <span className="text-[10px] font-bold text-black bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Auto-Generated
                  </span>
                </div>
                <input
                  type="text"
                  value={branchId}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-none shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 font-normal">
                  Auto-formatted with standard <span className="font-mono text-slate-600">EDUGATE_</span> identifier format.
                </p>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0112345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Branch Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Branch Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. No 123, Galle Road, Colombo 03"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs resize-none"
                  required
                />
              </div>
            </div>
          </form>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white flex items-center justify-end gap-3 shrink-0 shadow-lg">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleClose}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form="branch-add-form"
              loading={adding}
              disabled={adding || !name.trim() || !address.trim() || !phone.trim()}
            >
              Create Branch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
