import React, { useState } from 'react';
import useAuth from '../../hooks/Auth/useAuth';
import {
  User,
  Mail,
  Shield,
  Key,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Hash,
  UserCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, token, loading, fetchProfile } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);

  const handleRefresh = async () => {
    setRefreshMessage(null);
    const res = await fetchProfile(token);
    if (res.success) {
      setRefreshMessage({ type: 'success', text: 'Profile refreshed successfully from API!' });
    } else {
      setRefreshMessage({ type: 'error', text: res.error || 'Failed to refresh profile.' });
    }
    setTimeout(() => setRefreshMessage(null), 4000);
  };

  const formattedCreatedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const formattedUpdatedAt = user?.updated_at
    ? new Date(user.updated_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Toast Notification */}
      {refreshMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            refreshMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {refreshMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{refreshMessage.text}</span>
        </div>
      )}

      {/* Clean Corporate Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {user?.name || 'User Profile'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              {user?.status || 'ACTIVE'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            System account permissions, staff credentials, and active session configuration.
          </p>
        </div>

        {/* Toolbar Controls (Aligned to Right Side) */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
            <span>Refresh Profile</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: User Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-200/80 p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Account Details</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Verified Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.name || user?.fullName || 'Not specified'}</span>
              </p>
            </div>

            {/* Email Address */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>{user?.email || 'Not specified'}</span>
              </p>
            </div>

            {/* User Role */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Role</span>
              <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{user?.role_name || user?.role_id || user?.role || 'Administrator'}</span>
              </p>
            </div>

            {/* User ID */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">User Identifier</span>
              <p className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>#{user?.user_id || user?.id || '1'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: System & Branch Assignment Overview */}
        <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Assignment & Activity</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Live Sync
              </span>
            </div>

            {/* Branch Assignment Card */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Branch Allocation
              </span>
              <p className="text-xs font-bold text-slate-800">
                {user?.branch_name || `Branch #${user?.branch_id || '1'}`}
              </p>
            </div>

            {/* Account Status Card */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Session Status
              </span>
              <p className="text-xs font-bold text-emerald-900">
                {user?.status || 'ACTIVE'} • Authenticated
              </p>
            </div>

            {/* Registration Metadata */}
            {formattedCreatedAt && (
              <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member Since
                </span>
                <p className="text-xs font-semibold text-slate-700">{formattedCreatedAt}</p>
              </div>
            )}

            {formattedUpdatedAt && (
              <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Updated
                </span>
                <p className="text-xs font-semibold text-slate-700">{formattedUpdatedAt}</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Security Scheme: <span className="font-mono font-semibold text-blue-900">Bearer Token (JWT)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
