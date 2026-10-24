import React, { useState, useEffect } from 'react';
import ReferrerService from '../../../../services/Admin/referrerService';
import {
  X,
  Check,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

export default function ManageReferrerPaymentsModal({ isOpen, onClose, onSuccess }) {
  const [ratePerStudent, setRatePerStudent] = useState('1000');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      ReferrerService.getPaymentSettings()
        .then((res) => {
          const settings = res?.data?.data || res?.data || {};
          const currentRate = settings.rate_per_student !== undefined ? settings.rate_per_student : 1000;
          setRatePerStudent(String(currentRate));
        })
        .catch(() => {
          setRatePerStudent('1000');
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericRate = parseFloat(ratePerStudent);
    if (isNaN(numericRate) || numericRate < 0) {
      setError('Please enter a valid payment rate greater than or equal to 0.');
      return;
    }

    try {
      setSaving(true);
      await ReferrerService.updatePaymentSettings({
        rate_per_student: numericRate,
        currency: 'LKR',
        apply_to_all: true,
      });

      onSuccess?.(`Referrer payment price successfully updated to Rs. ${numericRate.toLocaleString()} per student!`);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to update payment settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const parsedRate = parseFloat(ratePerStudent) || 0;

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Manage Referrer Payments
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Assign commission price per student and configure payout calculation rates
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
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Price Assignment Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Student Referral Payout Rate
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">Commission Rate</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Payment Price Per Student (Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      Rs.
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 1000"
                      value={ratePerStudent}
                      onChange={(e) => setRatePerStudent(e.target.value)}
                      className="w-full pl-12 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    This amount will be multiplied by the number of students referred by a partner.
                  </p>
                </div>

                {/* Live Formula Preview Box */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Calculation Formula Preview</span>
                  </div>
                  <p className="text-slate-600">
                    If a partner refers <strong>5 students</strong>: 5 × Rs. {parsedRate.toLocaleString()} ={' '}
                    <strong className="text-slate-900 font-bold">Rs. {(5 * parsedRate).toLocaleString()}</strong>
                  </p>
                  <p className="text-slate-600">
                    If a partner refers <strong>10 students</strong>: 10 × Rs. {parsedRate.toLocaleString()} ={' '}
                    <strong className="text-slate-900 font-bold">Rs. {(10 * parsedRate).toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Price...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Payment Price</span>
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
