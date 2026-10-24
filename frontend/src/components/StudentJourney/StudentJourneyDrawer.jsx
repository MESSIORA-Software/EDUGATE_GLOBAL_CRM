import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
  GraduationCap,
  Banknote,
  FileCheck,
  Award,
  Plane,
} from 'lucide-react';
import studentJourneyService from '../../services/StudentJourney/studentJourneyService';

const GROUP_ICONS = {
  'Group A — Student, Registration and University': GraduationCap,
  'Group B — Show Money and Bank Statements': Banknote,
  'Group C — University Application and Documentation': FileCheck,
  'Group D — Tests and Interviews': Award,
  'Group E — University Payments and Admission': Banknote,
  'Group F — Visa, Embassy and Travel': Plane,
};

export default function StudentJourneyDrawer({ isOpen, student, columns, onClose, onSaveSuccess }) {
  const [values, setValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const clientId = student?.client_id;

  // Load latest student journey details and values when drawer opens
  useEffect(() => {
    if (isOpen && clientId) {
      loadStudentDetails();
    }
  }, [isOpen, clientId]);

  const loadStudentDetails = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await studentJourneyService.getStudentJourney(clientId);
      const fetchedVals = data?.values || {};
      setValues(fetchedVals);
      setInitialValues(fetchedVals);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load student tracking values.');
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Group columns logically
  const groupedColumns = useMemo(() => {
    const map = new Map();
    for (const col of columns || []) {
      const grp = col.display_group || 'Custom Tracking Columns';
      if (!map.has(grp)) {
        map.set(grp, []);
      }
      map.get(grp).push(col);
    }
    return Array.from(map.entries());
  }, [columns]);

  const groupsList = useMemo(() => {
    return groupedColumns.map(([grpName]) => grpName);
  }, [groupedColumns]);

  const handleInputChange = (fieldKey, value) => {
    setValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!clientId) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await studentJourneyService.updateStudentValues(clientId, values);
      setSuccessMsg('Journey tracking values saved successfully!');
      setInitialValues(res?.values || values);
      if (onSaveSuccess) onSaveSuccess(clientId, res?.values || values);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Discard and close?')) {
        return;
      }
    }
    onClose();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 lg:left-60 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/25 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {student.student_id || `EDU_STUDENT_${student.client_id}`}
                </span>
                {student.assigned_staff ? (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Staff: {student.assigned_staff.name}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Unassigned
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{student.student_name}</h2>
              <p className="text-xs text-slate-400">{student.email || 'No email on record'}</p>
            </div>

            {/* Header Actions (Matching Pipeline Buttons) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 shrink-0">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Group Filter Chips */}
          <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedGroup('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedGroup === 'ALL'
                  ? 'border border-blue-300 bg-blue-50/60 text-blue-900 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Sections
            </button>
            {groupsList.map((grpName) => {
              const Icon = GROUP_ICONS[grpName] || Layers;
              const shortLabel = grpName.split('—')[0]?.trim() || grpName;
              return (
                <button
                  key={grpName}
                  type="button"
                  onClick={() => setSelectedGroup(grpName)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedGroup === grpName
                      ? 'border border-blue-300 bg-blue-50/60 text-blue-900 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs">Loading tracking data...</span>
              </div>
            ) : (
              groupedColumns
                .filter(([grpName]) => selectedGroup === 'ALL' || selectedGroup === grpName)
                .map(([grpName, cols]) => {
                  const Icon = GROUP_ICONS[grpName] || Layers;
                  return (
                    <div key={grpName} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
                        <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                        <h3 className="text-xs font-bold uppercase tracking-wide">{grpName}</h3>
                        <span className="text-[11px] font-normal text-slate-400 ml-auto">
                          {cols.length} fields
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
                        {cols.map((col) => {
                          const val = values[col.field_key] ?? '';
                          return (
                            <div
                              key={col.field_key}
                              className={col.data_type === 'long_text' ? 'md:col-span-2' : ''}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <label className="font-semibold text-slate-700">
                                  {col.label}
                                  {col.is_required && <span className="text-rose-500 ml-0.5">*</span>}
                                </label>
                                {col.data_type === 'url' && val && (
                                  <a
                                    href={val}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                                  >
                                    Open <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              {/* Input renderers based on col.data_type */}
                              {col.data_type === 'single_select' ? (
                                <select
                                  value={val}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                >
                                  <option value="">— Select an Option —</option>
                                  {(col.options || []).map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : col.data_type === 'multi_select' ? (
                                <div className="space-y-1 bg-white p-2 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                                  {(col.options || []).map((opt) => {
                                    const currentList = Array.isArray(val) ? val : [];
                                    const isChecked = currentList.includes(opt);
                                    return (
                                      <label
                                        key={opt}
                                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 cursor-pointer text-xs"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              handleInputChange(col.field_key, [...currentList, opt]);
                                            } else {
                                              handleInputChange(
                                                col.field_key,
                                                currentList.filter((item) => item !== opt)
                                              );
                                            }
                                          }}
                                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-slate-700">{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : col.data_type === 'date' ? (
                                <input
                                  type="date"
                                  value={val || ''}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                />
                              ) : col.data_type === 'datetime' ? (
                                <input
                                  type="datetime-local"
                                  value={val ? String(val).slice(0, 16) : ''}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                />
                              ) : col.data_type === 'boolean' ? (
                                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(val)}
                                    onChange={(e) => handleInputChange(col.field_key, e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-slate-700 font-medium">
                                    {val ? 'Yes / Confirmed' : 'No / Pending'}
                                  </span>
                                </label>
                              ) : col.data_type === 'number' || col.data_type === 'currency' ? (
                                <input
                                  type="number"
                                  step={col.data_type === 'currency' ? '0.01' : '1'}
                                  value={val ?? ''}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  placeholder="0.00"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                />
                              ) : col.data_type === 'long_text' ? (
                                <textarea
                                  rows={3}
                                  value={val || ''}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  placeholder="Enter detailed notes..."
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs resize-y"
                                />
                              ) : (
                                <input
                                  type={col.data_type === 'url' ? 'url' : 'text'}
                                  value={typeof val === 'object' && val !== null ? val.original_name || val.url || '' : val || ''}
                                  onChange={(e) => handleInputChange(col.field_key, e.target.value)}
                                  placeholder={col.data_type === 'url' ? 'https://...' : 'Enter value...'}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Footer Controls (Matching Pipeline Modal Footer Buttons) */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-semibold">• Unsaved modifications</span>
              ) : (
                'All tracking values saved'
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
