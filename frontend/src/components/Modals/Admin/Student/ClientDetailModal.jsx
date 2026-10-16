import React from 'react';
import {
  X,
  User,
  Mail,
  Calendar,
  Share2,
  Hash,
  Phone,
  UserCheck,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';

// Channel icon helper
function getChannelBadge(sourceStr = '') {
  if (!sourceStr) return null;
  const lower = sourceStr.toLowerCase();

  if (lower.includes('messenger') || lower.includes('facebook') || lower.includes('fb')) {
    return {
      name: 'Messenger',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: (
        <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.43 3.19 7.07.16.13.26.33.26.54l-.07 1.7c-.03.74.77 1.25 1.41.87l1.91-1.12c.16-.1.35-.13.54-.1.87.23 1.79.35 2.76.35 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.06 13.06l-2.58-2.75-5.04 2.75 5.54-5.88 2.65 2.75 4.97-2.75-5.54 5.88z" />
        </svg>
      ),
    };
  }

  if (lower.includes('whatsapp') || lower.includes('wa')) {
    return {
      name: 'WhatsApp',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: (
        <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.07c-.24.68-1.2 1.25-1.95 1.34-.51.06-1.17.09-3.39-.83-2.84-1.18-4.66-4.08-4.8-4.27-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.24-.25.53-.31.71-.31.18 0 .35 0 .5.01.16.01.37-.06.58.44.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.21 2.17 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.75 1.86.88.27.13.45.2.52.31.06.11.06.64-.18 1.32z" />
        </svg>
      ),
    };
  }

  if (lower.includes('email') || lower.includes('mail')) {
    return {
      name: 'Email',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: (
        <svg className="w-3.5 h-3.5 stroke-[#7C3AED] fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    };
  }

  return {
    name: sourceStr,
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: <Share2 className="w-3.5 h-3.5 text-blue-600" />,
  };
}

export default function ClientDetailModal({ isOpen, client, onClose }) {
  if (!isOpen || !client) return null;

  const clientId = client.client_id || client.id || 'N/A';
  const oppId = client.opportunity_id;
  const clientName = client.name || 'Unnamed Client';
  const email = client.email || 'No email provided';
  const phone = client.phone || client.contact_number || client.mobile || 'Not provided';
  const dob = client.dob || 'Not specified';
  const source = client.source || 'Direct Contact';
  const stageName = client.status_name || client.stage || null;
  const staffName = client.staff_name || (client.staff ? (client.staff.name || client.staff.email) : null);
  const staffEmail = client.staff?.email || null;

  const channelInfo = getChannelBadge(source);

  const createdAt = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const initials = clientName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const staffInitials = staffName
    ? staffName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : null;

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Clean Corporate Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {initials || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{clientName}</h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  #STD-{clientId}
                </span>
                {oppId && (
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                    #OPP-{oppId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Student Profile & Pipeline Overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Contact Details Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Contact Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Email */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-500" /> Email Address
                </span>
                <p className="text-xs font-bold text-slate-800 truncate" title={email}>
                  {email}
                </p>
              </div>

              {/* Phone */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-500" /> Contact Number
                </span>
                <p className="text-xs font-bold text-slate-800 truncate">{phone}</p>
              </div>

              {/* Date of Birth */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" /> Date of Birth
                </span>
                <p className="text-xs font-bold text-slate-800">{dob}</p>
              </div>

              {/* Registration Date */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" /> Registered Date
                </span>
                <p className="text-xs font-bold text-slate-800">{createdAt || 'Active'}</p>
              </div>
            </div>
          </div>

          {/* Pipeline & Staff Assignment Card */}
          <div className="p-4 rounded-xl border border-blue-200/80 bg-white space-y-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pipeline & Staff Allocation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Lead Source (Clean Blue/Corporate Style - NOT green!) */}
              <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-blue-600" /> Lead Source Channel
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {channelInfo?.icon}
                  <span className="text-xs font-bold text-slate-800">{channelInfo?.name || source}</span>
                </div>
              </div>

              {/* Assigned Staff Member */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-slate-500" /> Assigned Staff
                </span>
                {staffName ? (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {staffInitials || 'ST'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{staffName}</p>
                      {staffEmail && <p className="text-[10px] text-slate-400 truncate">{staffEmail}</p>}
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 pt-0.5">
                    Unassigned Staff
                  </span>
                )}
              </div>
            </div>

            {/* Stage / Opportunity Status */}
            {stageName && (
              <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pipeline Stage</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {stageName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
