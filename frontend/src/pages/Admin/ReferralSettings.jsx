import React, { useState, useEffect, useCallback } from 'react';
import referrerService from '../../services/Admin/referrerService';
import pipelineService from '../../services/Admin/pipelineService';
import useAuth from '../../hooks/Auth/useAuth';
import {
  SlidersHorizontal,
  GitBranch,
  Wallet,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
  Check,
  ChevronDown,
  Building2,
  GraduationCap,
  Globe,
  DollarSign,
} from 'lucide-react';

export default function ReferralSettings() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Commission Trigger Stage State
  const [pipelineStages, setPipelineStages] = useState([]);
  const [selectedTriggerStageId, setSelectedTriggerStageId] = useState('');
  const [savedTriggerStageId, setSavedTriggerStageId] = useState('');
  const [savingTrigger, setSavingTrigger] = useState(false);

  // 2. Default Commission Rate State
  const [ratePerStudent, setRatePerStudent] = useState(1000);
  const [currency, setCurrency] = useState('LKR');
  const [applyToAll, setApplyToAll] = useState(true);
  const [savingRate, setSavingRate] = useState(false);

  // 3. Referrer Eligibility Roles / Types
  const [eligibilityRoles, setEligibilityRoles] = useState([
    {
      id: 'EXTERNAL',
      name: 'External Referral Partners',
      description: 'Education consultants, agents, independent partners, and professional network affiliates.',
      icon: Globe,
      enabled: true,
      badge: 'Default',
    },
    {
      id: 'STUDENT',
      name: 'Student & Alumni Referrers',
      description: 'Enrolled candidates, alumni, and former students recommending peers.',
      icon: GraduationCap,
      enabled: true,
      badge: 'Active',
    },
    {
      id: 'INSTITUTION',
      name: 'Institutional Affiliates',
      description: 'Partner schools, colleges, language institutes, and affiliated educational centers.',
      icon: Building2,
      enabled: true,
      badge: 'Active',
    },
  ]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [triggerRes, stagesRes, paymentSettingsRes] = await Promise.all([
        referrerService.getReferralTriggerStage(),
        pipelineService.getAllOpportunityStatuses(),
        referrerService.getReferralSettings(),
      ]);

      // Active pipeline stages
      const rawStages = Array.isArray(stagesRes?.data?.data)
        ? stagesRes.data.data
        : Array.isArray(stagesRes?.data)
        ? stagesRes.data
        : [];
      const activeStages = rawStages.filter((s) => s.is_active !== false);
      setPipelineStages(activeStages);

      // Trigger stage config
      const triggerId = triggerRes?.data?.data?.commission_trigger_stage_id;
      const initialTriggerId = triggerId !== null && triggerId !== undefined ? String(triggerId) : '';
      setSelectedTriggerStageId(initialTriggerId);
      setSavedTriggerStageId(initialTriggerId);

      // Commission rate settings
      const pData = paymentSettingsRes?.data?.data || paymentSettingsRes?.data || {};
      if (pData.rate_per_student !== undefined) {
        setRatePerStudent(Number(pData.rate_per_student) || 1000);
      }
      if (pData.currency) {
        setCurrency(pData.currency);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to load referral settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Save Trigger Stage
  const handleSaveTriggerStage = async () => {
    try {
      setSavingTrigger(true);
      const stageIdToSave = selectedTriggerStageId ? Number(selectedTriggerStageId) : null;
      await referrerService.updateReferralTriggerStage(stageIdToSave);
      setSavedTriggerStageId(selectedTriggerStageId);
      showToast('Referral commission trigger stage updated successfully!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update trigger stage', 'error');
    } finally {
      setSavingTrigger(false);
    }
  };

  // Save Commission Rate
  const handleSaveRateSettings = async (e) => {
    e.preventDefault();
    const parsedRate = Number(ratePerStudent);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      showToast('Please enter a valid positive commission amount.', 'error');
      return;
    }

    try {
      setSavingRate(true);
      await referrerService.updateReferralSettings({
        rate_per_student: parsedRate,
        currency,
        apply_to_all: applyToAll,
      });
      showToast('Default referral commission rate updated successfully!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update commission rate', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header matching Admin System */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Referral Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Configure referral partner eligibility, commission payout rules, and pipeline-based commission qualification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllSettings}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>

      {loading && !pipelineStages.length ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center text-slate-500 shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="font-semibold text-xs">Loading referral settings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* SECTION 1: Referrer Eligibility */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Referrer Eligibility
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Authorized partner types eligible to hold referral codes and earn commissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Staff Separation Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Internal CRM Staff Policy:</span>
                <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                  Internal CRM staff members do <strong>NOT</strong> automatically become commission-earning referrers merely because they are CRM users. A CRM user account and a referral partner identity are strictly separate concepts. Staff can create and manage referral partners, but cannot earn referral commissions on their own employee accounts.
                </p>
              </div>
            </div>

            {/* Eligible Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {eligibilityRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-slate-800">{role.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Commission Rate Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <Wallet className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Commission Rate Settings
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Set standard referral payout amounts per enrolled student.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveRateSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Default Rate Per Student <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                      Rs.
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="50"
                      value={ratePerStudent}
                      onChange={(e) => setRatePerStudent(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                      placeholder="1000"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Amount credited when a candidate qualifies at the trigger stage.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Settlement Currency
                  </label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="appearance-none w-full pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white cursor-pointer"
                    >
                      <option value="LKR">LKR (Sri Lankan Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="GBP">GBP (British Pound)</option>
                      <option value="AUD">AUD (Australian Dollar)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={(e) => setApplyToAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Apply default rate across active referrers without custom rates</span>
                </label>

                <button
                  type="submit"
                  disabled={savingRate}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  {savingRate ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Rate...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Rate Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 3: Referral Commission Trigger */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white rounded-2xl border border-blue-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Referral Commission Trigger
                  </h2>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>When a referred student enters this stage, the referral commission will be created automatically.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex flex-col">
                  <label htmlFor="settings-trigger-stage" className="text-[11px] font-semibold text-slate-600 mb-1">
                    Select existing pipeline stage
                  </label>
                  <div className="relative min-w-[220px]">
                    <select
                      id="settings-trigger-stage"
                      value={selectedTriggerStageId}
                      onChange={(e) => setSelectedTriggerStageId(e.target.value)}
                      disabled={loading || savingTrigger}
                      className="appearance-none w-full pl-3.5 pr-8 py-2 border border-blue-300 bg-white rounded-xl text-xs font-semibold text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      <option value="">-- No Trigger Stage (Disabled) --</option>
                      {pipelineStages.map((stage) => (
                        <option key={stage.status_id} value={String(stage.status_id)}>
                          {stage.status_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:self-end">
                  <button
                    type="button"
                    onClick={handleSaveTriggerStage}
                    disabled={savingTrigger || loading || selectedTriggerStageId === savedTriggerStageId}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                  >
                    {savingTrigger ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/80 text-[11px] text-slate-500 leading-relaxed">
              ⓘ Reconfiguring the commission trigger stage will apply exclusively to <strong>future student pipeline transitions</strong>. All historical commissions and previous payout settlements are permanently protected and will not be altered or recalculated.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
