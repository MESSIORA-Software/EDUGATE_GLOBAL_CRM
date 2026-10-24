import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Sliders,
  Archive,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Loader2,
  Tag,
  Eye,
  EyeOff,
  Edit2,
  Search,
  CheckCircle2,
} from 'lucide-react';
import studentJourneyService from '../../services/StudentJourney/studentJourneyService';

const DATA_TYPES = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text / Notes' },
  { value: 'date', label: 'Date (YYYY-MM-DD)' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency / Amount' },
  { value: 'boolean', label: 'Yes / No (Boolean)' },
  { value: 'single_select', label: 'Single Select Dropdown' },
  { value: 'multi_select', label: 'Multi-Select Options' },
  { value: 'url', label: 'Web Link (URL)' },
  { value: 'file_ref', label: 'Document / File Reference' },
];

const PRESET_GROUPS = [
  'Group A — Student, Registration and University',
  'Group B — Show Money and Bank Statements',
  'Group C — University Application and Documentation',
  'Group D — Tests and Interviews',
  'Group E — University Payments and Admission',
  'Group F — Visa, Embassy and Travel',
  'Custom Tracking Columns',
];

export default function ManageColumnsModal({ isOpen, onClose, onColumnsChanged }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'add' | 'edit' | 'archived'
  const [columns, setColumns] = useState([]);
  const [archivedColumns, setArchivedColumns] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Add Column Form State
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('short_text');
  const [newGroup, setNewGroup] = useState(PRESET_GROUPS[0]);
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  // Edit Column Form State
  const [editingCol, setEditingCol] = useState(null);
  const [editOptionInput, setEditOptionInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadColumns();
      setActiveTab('active');
      setEditingCol(null);
      setSearchFilter('');
      setError(null);
      setSuccessMsg(null);
      resetAddForm();
    }
  }, [isOpen]);

  const resetAddForm = () => {
    setNewKey('');
    setNewLabel('');
    setNewType('short_text');
    setNewGroup(PRESET_GROUPS[0]);
    setNewRequired(false);
    setNewOptions([]);
    setNewOptionInput('');
  };

  const loadColumns = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeList, archivedList] = await Promise.all([
        studentJourneyService.getColumns(),
        studentJourneyService.getArchivedColumns().catch(() => []),
      ]);
      setColumns(activeList || []);
      setArchivedColumns(archivedList || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load columns.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (col) => {
    const rawOptions = col.options;
    const normalizedOptions = Array.isArray(rawOptions)
      ? rawOptions
      : typeof rawOptions === 'string'
      ? rawOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    setEditingCol({
      ...col,
      options: normalizedOptions,
    });
    setEditOptionInput('');
    setActiveTab('edit');
    setError(null);
    setSuccessMsg(null);
  };

  // Option chip management for Add Form
  const handleAddNewOption = (e) => {
    if (e) e.preventDefault();
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (newOptions.includes(trimmed)) {
      setError(`Option "${trimmed}" is already added.`);
      return;
    }
    setNewOptions([...newOptions, trimmed]);
    setNewOptionInput('');
    setError(null);
  };

  const handleRemoveNewOption = (indexToRemove) => {
    setNewOptions(newOptions.filter((_, idx) => idx !== indexToRemove));
  };

  // Option chip management for Edit Form
  const handleAddEditOption = (e) => {
    if (e) e.preventDefault();
    const trimmed = editOptionInput.trim();
    if (!trimmed || !editingCol) return;
    const currentOptions = Array.isArray(editingCol.options) ? editingCol.options : [];
    if (currentOptions.includes(trimmed)) {
      setError(`Option "${trimmed}" is already added.`);
      return;
    }
    setEditingCol({
      ...editingCol,
      options: [...currentOptions, trimmed],
    });
    setEditOptionInput('');
    setError(null);
  };

  const handleRemoveEditOption = (indexToRemove) => {
    if (!editingCol) return;
    const currentOptions = Array.isArray(editingCol.options) ? editingCol.options : [];
    setEditingCol({
      ...editingCol,
      options: currentOptions.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setError('Column label is required.');
      return;
    }

    const key = newKey.trim() || newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 50);

    if ((newType === 'single_select' || newType === 'multi_select') && newOptions.length === 0) {
      setError('Please add at least one option using the "+" button for select fields.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await studentJourneyService.createColumn({
        field_key: key,
        label: newLabel.trim(),
        data_type: newType,
        display_group: newGroup,
        is_required: newRequired,
        options: (newType === 'single_select' || newType === 'multi_select') ? newOptions : [],
      });

      setSuccessMsg(`Column "${newLabel.trim()}" created successfully!`);
      resetAddForm();
      setActiveTab('active');
      await loadColumns();
      if (onColumnsChanged) onColumnsChanged();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create column.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateColumn = async (e) => {
    e.preventDefault();
    if (!editingCol) return;

    const isSelect = editingCol.data_type === 'single_select' || editingCol.data_type === 'multi_select';
    const currentOpts = Array.isArray(editingCol.options) ? editingCol.options : [];

    if (isSelect && currentOpts.length === 0) {
      setError('Please add at least one allowed option using the "+" button.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await studentJourneyService.updateColumn(editingCol.column_id, {
        label: editingCol.label,
        display_group: editingCol.display_group,
        is_required: editingCol.is_required,
        is_visible: editingCol.is_visible,
        options: isSelect ? currentOpts : [],
      });

      setSuccessMsg(`Column "${editingCol.label}" updated successfully.`);
      setActiveTab('active');
      setEditingCol(null);
      await loadColumns();
      if (onColumnsChanged) onColumnsChanged();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update column.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (col) => {
    if (!window.confirm(`Are you sure you want to archive column "${col.label}"? Existing student values will remain safely preserved and can be restored.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await studentJourneyService.archiveColumn(col.column_id);
      setSuccessMsg(`Column "${col.label}" archived.`);
      if (editingCol?.column_id === col.column_id) {
        setEditingCol(null);
        setActiveTab('active');
      }
      await loadColumns();
      if (onColumnsChanged) onColumnsChanged();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to archive column.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (col) => {
    setSaving(true);
    setError(null);
    try {
      await studentJourneyService.restoreColumn(col.column_id);
      setSuccessMsg(`Column "${col.label}" restored successfully.`);
      await loadColumns();
      if (onColumnsChanged) onColumnsChanged();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to restore column.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;
    setColumns(newCols);

    try {
      await studentJourneyService.reorderColumns(newCols.map((c) => c.column_id));
      if (onColumnsChanged) onColumnsChanged();
    } catch (err) {
      setError('Failed to save new column order.');
      await loadColumns();
    }
  };

  const filteredColumns = useMemo(() => {
    if (!searchFilter.trim()) return columns;
    const term = searchFilter.toLowerCase().trim();
    return columns.filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        c.field_key.toLowerCase().includes(term) ||
        c.display_group.toLowerCase().includes(term)
    );
  }, [columns, searchFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Student Journey Columns</h3>
                <p className="text-xs text-slate-500">
                  Configure, reorder, edit options, and archive dynamic tracking fields
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab Navigation (Matching Student Pipeline Button/Control Aesthetics) */}
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              {/* Tab 1: Active Columns */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('active');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'active'
                    ? 'border border-blue-400 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border border-blue-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <span>Active Columns</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-200/60 text-blue-900 text-[10px]">
                  {columns.length}
                </span>
              </button>

              {/* Tab 2: Dedicated Add Column Tab */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('add');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'add'
                    ? 'border border-blue-400 bg-blue-50/70 text-blue-900 font-bold'
                    : 'border border-blue-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Column</span>
              </button>

              {/* Tab 3: Dedicated Edit Column Tab (Visible when editing) */}
              {editingCol && (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('edit');
                      setError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-l-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                      activeTab === 'edit'
                        ? 'border border-red-400 bg-red-50/70 text-red-900 font-bold'
                        : 'border border-red-200 bg-white text-slate-700 hover:border-red-400 hover:bg-red-50/30'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Edit: {editingCol.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCol(null);
                      setActiveTab('active');
                    }}
                    title="Close edit tab"
                    className={`px-2 py-2 rounded-r-xl text-xs border-y border-r transition-colors cursor-pointer ${
                      activeTab === 'edit'
                        ? 'border-red-400 bg-red-100 text-red-800 hover:bg-red-200'
                        : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Tab 4: Archived Columns */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('archived');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'archived'
                    ? 'border border-slate-400 bg-slate-100 text-slate-900 font-bold'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-slate-500" />
                <span>Archived ({archivedColumns.length})</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* TAB 1: ACTIVE COLUMNS LIST */}
            {activeTab === 'active' && (
              <div className="space-y-3">
                {/* Search in Active Columns */}
                <div className="flex items-center justify-between gap-3 pb-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search column name or key..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-blue-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs transition-colors"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    Showing {filteredColumns.length} of {columns.length} columns
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs">Loading columns...</span>
                  </div>
                ) : filteredColumns.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No matching columns found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredColumns.map((col, idx) => (
                      <div
                        key={col.column_id}
                        className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-2xs group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-0.5 shrink-0 text-slate-400">
                            <button
                              type="button"
                              disabled={idx === 0 || Boolean(searchFilter)}
                              onClick={() => handleMoveOrder(idx, 'up')}
                              className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === columns.length - 1 || Boolean(searchFilter)}
                              onClick={() => handleMoveOrder(idx, 'down')}
                              className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 truncate">{col.label}</span>
                              {col.is_required && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                                  REQ
                                </span>
                              )}
                              {!col.is_visible && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 flex items-center gap-1 font-medium">
                                  <EyeOff className="w-3 h-3" /> Hidden
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                              <span className="font-mono text-slate-500">{col.field_key}</span>
                              <span>•</span>
                              <span className="capitalize">{col.data_type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span className="text-slate-400 truncate max-w-xs">{col.display_group}</span>
                              {(col.data_type === 'single_select' || col.data_type === 'multi_select') && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-medium">
                                    {Array.isArray(col.options) ? col.options.length : 0} options
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions (Matching Student Pipeline Button Styles) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(col)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                            title="Edit Column in Dedicated Tab"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(col)}
                            className="flex items-center gap-1 p-2 rounded-xl border border-red-200 bg-red-50/40 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer shadow-2xs"
                            title="Archive Column"
                          >
                            <Archive className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DEDICATED ADD COLUMN TAB */}
            {activeTab === 'add' && (
              <form onSubmit={handleCreateColumn} className="p-5 bg-blue-50/30 rounded-2xl border border-blue-200/80 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Add New Dynamic Tracking Column
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Display Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. Flight Departure Date"
                      value={newLabel}
                      onChange={(e) => {
                        setNewLabel(e.target.value);
                        if (!newKey) {
                          setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40));
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Immutable Field Key *</label>
                    <input
                      type="text"
                      placeholder="e.g. flight_departure_date"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ''))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Internal unique key. Cannot be changed once created.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data Type *</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                    >
                      {DATA_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Display Group *</label>
                    <select
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                    >
                      {PRESET_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ONE-BY-ONE OPTION ADDER WITH PLUS MARK (NEW COLUMN) */}
                  {(newType === 'single_select' || newType === 'multi_select') && (
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-700">
                          Allowed Options *
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {newOptions.length} option{newOptions.length === 1 ? '' : 's'} added
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type an option name and click '+ Add Option' or press Enter..."
                          value={newOptionInput}
                          onChange={(e) => setNewOptionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewOption();
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewOption}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-900 text-xs font-semibold hover:bg-blue-100 hover:border-blue-500 transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Add Option</span>
                        </button>
                      </div>

                      {/* Chips / Pills List */}
                      {newOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200/90 rounded-xl max-h-36 overflow-y-auto shadow-2xs">
                          {newOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 text-xs font-medium shadow-2xs animate-in fade-in"
                            >
                              <span>{opt}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewOption(idx)}
                                className="p-0.5 rounded text-blue-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove option"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          No options added yet. Type an option name above and click <strong>Add Option</strong> (or press Enter).
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="newRequired"
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="newRequired" className="font-semibold text-slate-700 cursor-pointer">
                      Required Field (cannot be saved empty)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-blue-200/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>Create Column</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: DEDICATED EDIT COLUMN TAB */}
            {activeTab === 'edit' && (
              editingCol ? (
                <form onSubmit={handleUpdateColumn} className="p-5 bg-red-50/20 rounded-2xl border border-red-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-red-200/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        <Edit2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                          Edit Column: {editingCol.label}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-red-800 font-mono">
                          <span>Key: {editingCol.field_key}</span>
                          <span>•</span>
                          <span>Type: {editingCol.data_type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('active');
                        setEditingCol(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Display Label *</label>
                      <input
                        type="text"
                        value={editingCol.label}
                        onChange={(e) => setEditingCol({ ...editingCol, label: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Display Group *</label>
                      <select
                        value={editingCol.display_group}
                        onChange={(e) => setEditingCol({ ...editingCol, display_group: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs cursor-pointer"
                      >
                        {PRESET_GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ONE-BY-ONE OPTION ADDER WITH PLUS MARK (EDIT COLUMN) */}
                    {(editingCol.data_type === 'single_select' || editingCol.data_type === 'multi_select') && (
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-slate-700">
                            Allowed Options *
                          </label>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {(editingCol.options || []).length} option{(editingCol.options || []).length === 1 ? '' : 's'} defined
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type an option name and click '+ Add Option' or press Enter..."
                            value={editOptionInput}
                            onChange={(e) => setEditOptionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddEditOption();
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddEditOption}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 bg-red-50/50 text-red-900 text-xs font-semibold hover:bg-red-100 hover:border-red-500 transition-all cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-red-600" />
                            <span>Add Option</span>
                          </button>
                        </div>

                        {/* Chips / Pills List */}
                        {editingCol.options && editingCol.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200/90 rounded-xl max-h-36 overflow-y-auto shadow-2xs">
                            {editingCol.options.map((opt, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-950 text-xs font-medium shadow-2xs animate-in fade-in"
                              >
                                <span>{opt}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditOption(idx)}
                                  className="p-0.5 rounded text-red-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove option"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            No options defined. Add options above using the <strong>Add Option</strong> button.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-6 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editingCol.is_required}
                          onChange={(e) => setEditingCol({ ...editingCol, is_required: e.target.checked })}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        Required Field
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editingCol.is_visible !== false}
                          onChange={(e) => setEditingCol({ ...editingCol, is_visible: e.target.checked })}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        Visible in Spreadsheet Table
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-red-200/70">
                    <button
                      type="button"
                      onClick={() => handleArchive(editingCol)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 bg-red-50/40 text-red-900 text-xs font-semibold hover:bg-red-50 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
                    >
                      <Archive className="w-3.5 h-3.5 text-red-600" />
                      <span>Archive this column</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('active');
                          setEditingCol(null);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                      >
                        {saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No column selected for editing. Please click "Edit" on a column in the Active Columns tab.
                </div>
              )
            )}

            {/* TAB 4: ARCHIVED COLUMNS */}
            {activeTab === 'archived' && (
              archivedColumns.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No archived columns found.
                </div>
              ) : (
                <div className="space-y-2">
                  {archivedColumns.map((col) => (
                    <div
                      key={col.column_id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs opacity-90 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-700 line-through truncate">{col.label}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                          <span className="font-mono">{col.field_key}</span>
                          <span>•</span>
                          <span>{col.data_type}</span>
                          <span>•</span>
                          <span>{col.display_group}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestore(col)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 shrink-0">
            <span>Changes take effect immediately across all student views.</span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
