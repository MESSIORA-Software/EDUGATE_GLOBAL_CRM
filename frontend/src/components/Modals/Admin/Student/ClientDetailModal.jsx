import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPipelineData } from '../../../../actions/Admin/pipelineAction';
import {
  X,
  Mail,
  Calendar,
  Share2,
  Phone,
  Layers,
  Copy,
  Check,
  Edit2,
  Award,
} from 'lucide-react';
import Button from '../../../ui/Button';
import referrerService from '../../../../services/Admin/referrerService';

export default function ClientDetailModal({ isOpen, client, onClose, onEdit }) {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);

  const { opportunities = [], statuses = [] } = useSelector((state) => state.pipeline ?? {});

  useEffect(() => {
    if (isOpen && opportunities.length === 0) {
      dispatch(fetchPipelineData());
    }
  }, [isOpen, opportunities.length, dispatch]);

  useEffect(() => {
    if (client) {
      if (client.referrers) {
        setReferrerInfo(client.referrers);
      } else if (client.referrer_id) {
        referrerService
          .getReferrerById(client.referrer_id)
          .then((res) => setReferrerInfo(res?.data?.data || res?.data))
          .catch(() => setReferrerInfo(null));
      } else {
        setReferrerInfo(null);
      }
    }
  }, [client]);

  const clientId = client?.client_id || client?.id || '';

  const studentOpportunity = useMemo(() => {
    if (!clientId) return null;
    return opportunities.find((opp) => Number(opp.client_id) === Number(clientId));
  }, [opportunities, clientId]);

  const currentStageName = useMemo(() => {
    if (!studentOpportunity) return 'Not Created Opportunity';
    const matchedStatus = statuses.find(
      (s) => Number(s.status_id) === Number(studentOpportunity.status_id)
    );
    return (
      matchedStatus?.name ||
      studentOpportunity.status_name ||
      client?.status_name ||
      'In Pipeline'
    );
  }, [studentOpportunity, statuses, client?.status_name]);

  if (!isOpen || !client) return null;

  const formattedClientId = clientId
    ? String(clientId).startsWith('EDU_STUDENT_')
      ? String(clientId)
      : `EDU_STUDENT_${clientId}`
    : 'N/A';
  const clientName = client.name || 'Unnamed Student';
  const email = client.email || 'No email provided';
  const phone = client.phone || client.contact_number || client.mobile || 'Not specified';
  const dob = client.dob || 'Not specified';
  const source = client.source || 'Direct Contact';

  const createdAt = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Active';

  const handleCopyId = () => {
    if (!formattedClientId) return;
    navigator.clipboard?.writeText(formattedClientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReferee = Boolean(
    referrerInfo ||
      client.referrer_id ||
      client.referrers ||
      source?.toLowerCase().includes('referee') ||
      source?.toLowerCase().includes('refer')
  );

  const refereeName = referrerInfo?.name || client.referrers?.name;

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
          {/* Drawer Header without icon */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Student Profile Details
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Comprehensive student inquiry, credentials, and pipeline status
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

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Student Information
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Core identity credentials and academic records
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    {formattedClientId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all text-xs cursor-pointer"
                    title="Copy Student ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                    Student Full Name
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{clientName}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Email Address
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{email}</span>
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Contact Number
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{phone}</span>
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Date of Birth
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{dob}</span>
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1">
                      Date Registered
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{createdAt}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline & Inquiry Source Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="pb-2 border-b border-slate-200/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Lead & Pipeline Information
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Consultation intake channels and opportunity progression
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Lead Source Channel */}
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1.5">
                    Lead Source Channel
                  </span>
                  <div className="flex items-center gap-2">
                    {isReferee ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Referee: {refereeName || 'Assigned Referee'}</span>
                        {(referrerInfo?.referrer_code || client.referrers?.referrer_code) && (
                          <span className="font-mono text-[10px] text-blue-700 bg-white px-1.5 py-0.5 rounded border border-amber-200 ml-1">
                            {referrerInfo?.referrer_code || client.referrers?.referrer_code}
                          </span>
                        )}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-800">{source}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pipeline Stage (Assigned Staff Member completely removed) */}
                <div className="pt-1">
                  <span className="font-semibold text-slate-500 block text-[11px] uppercase tracking-wider mb-1.5">
                    Pipeline Stage
                  </span>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    {studentOpportunity ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                          EDU_OPP_{studentOpportunity.opportunity_id}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>{currentStageName}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                        <span>Not Created Opportunity</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Referring Partner / Referee Details */}
            {(referrerInfo || source?.toLowerCase().includes('referee') || client.referrer_id) && (
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                        Referring Partner (Referee)
                      </h3>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Referral partner information and performance points
                      </p>
                    </div>
                  </div>
                  {referrerInfo?.referrer_code && (
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white text-blue-900 border border-amber-300 shadow-2xs">
                      {referrerInfo.referrer_code}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                      Referee Full Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {referrerInfo?.name || 'Assigned Referee'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {referrerInfo?.phone_number && (
                      <div>
                        <span className="font-semibold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                          Phone Number
                        </span>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{referrerInfo.phone_number}</span>
                        </p>
                      </div>
                    )}

                    {referrerInfo?.whatsapp_number && (
                      <div>
                        <span className="font-semibold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                          WhatsApp Number
                        </span>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{referrerInfo.whatsapp_number}</span>
                        </p>
                      </div>
                    )}

                    {referrerInfo?.email && (
                      <div>
                        <span className="font-semibold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                          Email Address
                        </span>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>{referrerInfo.email}</span>
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                        Referral Points
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        +10 Score Points
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onEdit(client);
                }}
                className="flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Student</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
