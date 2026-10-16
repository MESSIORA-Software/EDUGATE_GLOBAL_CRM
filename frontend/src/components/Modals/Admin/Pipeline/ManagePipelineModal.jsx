import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addOpportunityStatus,
  updatePipelineStatus,
  deletePipelineStatus,
} from '../../../../actions/Admin/pipelineAction';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import {
  X,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Layers,
  ArrowDownUp,
  ShieldAlert,
} from 'lucide-react';

export default function ManagePipelineModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const {
    statuses = [],
    opportunities = [],
    addingStatus = false,
    updatingStatus = false,
    deletingStatus = false,
  } = useSelector((state) => state.pipeline ?? {});

  // New Status form state
  const [newStatusName, setNewStatusName] = useState('');
  const [newStageOrder, setNewStageOrder] = useState('1');

  // Inline editing state: { [status_id]: { name, order } }
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState('1');

  const [modalError, setModalError] = useState('');

  if (!isOpen) return null;

  // Add new status
  const handleAddStatus = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!newStatusName.trim()) {
      setModalError('Stage / Status Name is required.');
      return;
    }

    const res = await dispatch(
      addOpportunityStatus(newStatusName.trim(), Number(newStageOrder) || 1)
    );

    if (res?.success) {
      setNewStatusName('');
      setNewStageOrder(String((statuses.length || 0) + 1));
      onSuccess?.(`Status "${newStatusName.trim()}" created successfully!`);
    } else {
      setModalError(res?.error || 'Failed to create status stage.');
    }
  };

  // Start edit
  const handleStartEdit = (status) => {
    setEditingStatusId(status.status_id);
    setEditName(status.status_name);
    setEditOrder(String(status.stage_order || 1));
    setModalError('');
  };

  // Save edit
  const handleSaveEdit = async (statusId) => {
    setModalError('');
    if (!editName.trim()) {
      setModalError('Status Name cannot be empty.');
      return;
    }

    const res = await dispatch(
      updatePipelineStatus(statusId, editName.trim(), Number(editOrder) || 1)
    );

    if (res?.success) {
      setEditingStatusId(null);
      onSuccess?.(`Status updated to "${editName.trim()}" successfully!`);
    } else {
      setModalError(res?.error || 'Failed to update status.');
    }
  };

  // Delete status
  const handleDeleteStatus = async (status) => {
    setModalError('');
    const oppCount = opportunities.filter((o) => o.status_id === status.status_id).length;

    if (oppCount > 0) {
      setModalError(
        `Cannot delete "${status.status_name}": It has ${oppCount} active opportunities under it. Please move or reassign them first.`
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete the "${status.status_name}" status stage?`
      )
    ) {
      return;
    }

    const res = await dispatch(deletePipelineStatus(status.status_id));
    if (res?.success) {
      onSuccess?.(`Status "${status.status_name}" deleted successfully!`);
    } else {
      setModalError(res?.error || 'Failed to delete status.');
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <Sliders className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Manage Pipeline</h3>
              <p className={TYPOGRAPHY.caption}>
                Configure pipeline status stages, order, and column visibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {modalError && (
            <div className="flex gap-2.5 p-3 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Add New Stage Box */}
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add New Pipeline Stage</span>
            </h4>
            <form onSubmit={handleAddStatus} className="flex flex-col sm:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Stage Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Documentation Pending, Visa Applied"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={newStageOrder}
                  onChange={(e) => setNewStageOrder(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Plus}
                loading={addingStatus}
                className="w-full sm:w-auto shrink-0"
              >
                Add Stage
              </Button>
            </form>
          </div>

          {/* Existing Stages List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Current Pipeline Stages ({statuses.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Sorted by Column Position
              </span>
            </div>

            <div className="space-y-2">
              {statuses.map((status, index) => {
                const isEditing = editingStatusId === status.status_id;
                const oppCount = opportunities.filter((o) => o.status_id === status.status_id).length;
                const hasOpportunities = oppCount > 0;

                return (
                  <div
                    key={status.status_id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 w-full px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <span className="text-[11px] text-slate-400 font-mono">Pos:</span>
                          <input
                            type="number"
                            min="1"
                            value={editOrder}
                            onChange={(e) => setEditOrder(e.target.value)}
                            className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(status.status_id)}
                            disabled={updatingStatus}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold px-2.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStatusId(null)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            #{status.stage_order || index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {status.status_name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Status ID: {status.status_id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 justify-end">
                          {/* Opportunity Count Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              hasOpportunities
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span>{oppCount} {oppCount === 1 ? 'Opportunity' : 'Opportunities'}</span>
                          </span>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(status)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                            title="Edit Stage Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button (Disabled if opportunities exist) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStatus(status)}
                            disabled={hasOpportunities || deletingStatus}
                            style={{
                              cursor: hasOpportunities ? 'not-allowed' : 'pointer',
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              hasOpportunities
                                ? 'border-slate-200 text-slate-300 bg-slate-50 opacity-60'
                                : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                            }`}
                            title={
                              hasOpportunities
                                ? `Cannot delete: ${oppCount} active opportunities in this stage`
                                : 'Delete Stage'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3 border-t bg-slate-50 shrink-0"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Stages containing active opportunities cannot be deleted.</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
