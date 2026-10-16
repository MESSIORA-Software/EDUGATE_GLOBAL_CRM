import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addOpportunityStatus } from '../../../../actions/Admin/pipelineAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, PlusCircle, AlertCircle, Layers, ArrowDownUp } from 'lucide-react';

export default function AddStatusModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { addingStatus } = useSelector((state) => state.pipeline ?? {});

  const [statusName, setStatusName] = useState('');
  const [stageOrder, setStageOrder] = useState('1');
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setStatusName('');
    setStageOrder('1');
    setSubmitError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!statusName.trim()) {
      setSubmitError('Status / Stage Name is required.');
      return;
    }

    const res = await dispatch(addOpportunityStatus(statusName.trim(), Number(stageOrder) || 1));
    if (res?.success) {
      resetForm();
      onSuccess?.(`Status "${statusName.trim()}" created successfully!`);
      onClose();
    } else {
      setSubmitError(res?.error || 'Failed to create status.');
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-md w-full overflow-hidden"
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
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Add Pipeline Status</h3>
              <p className={TYPOGRAPHY.caption}>Create a new stage / column in the pipeline</p>
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

          {/* Status Name */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Status Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <div className="relative">
              <Layers style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Applied, Under Review, Interview Scheduled"
                value={statusName}
                onChange={(e) => {
                  setStatusName(e.target.value);
                  setSubmitError('');
                }}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Stage Order */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Stage Order / Column Position
            </label>
            <div className="relative">
              <ArrowDownUp style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
              <input
                type="number"
                min="1"
                placeholder="1, 2, 3..."
                value={stageOrder}
                onChange={(e) => setStageOrder(e.target.value)}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Determines left-to-right order of the column in the pipeline board.
            </p>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={addingStatus}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={addingStatus}>
              Create Status Column
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
