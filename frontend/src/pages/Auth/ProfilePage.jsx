import React, { useState } from 'react';
import useAuth from '../../hooks/Auth/useAuth';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const formattedCreatedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const formattedUpdatedAt = user?.updated_at
    ? new Date(user.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-7xl mx-auto">
      {/* Top Banner / Header Card */}
      <div
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
        className="rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              backgroundColor: COLORS.primaryLight,
              color: COLORS.primary,
              borderColor: COLORS.primaryBorder,
            }}
            className="w-14 h-14 rounded-2xl border flex items-center justify-center font-extrabold text-xl shadow-xs"
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={TYPOGRAPHY.h2}>
                {user?.name || 'User Profile'}
              </h1>
              <Badge variant="green" icon={CheckCircle2}>
                {user?.status || 'ACTIVE'}
              </Badge>
            </div>
            <p className={TYPOGRAPHY.subheading}>
              System Account & Authentication Profile Overview
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={handleRefresh}
          >
            Refresh Profile
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {refreshMessage && (
        <div
          style={{
            backgroundColor: refreshMessage.type === 'success' ? COLORS.successLight : COLORS.secondaryLight,
            borderColor: refreshMessage.type === 'success' ? '#A7F3D0' : COLORS.secondaryBorder,
            color: refreshMessage.type === 'success' ? COLORS.success : COLORS.secondary,
          }}
          className="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2"
        >
          {refreshMessage.type === 'success' ? (
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{refreshMessage.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: User Details */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
          className="lg:col-span-2 rounded-2xl border p-5 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: COLORS.border }}>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-[#1E3A8A]" />
              <span>Personal & Account Details</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Verified Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border space-y-1"
            >
              <span className={TYPOGRAPHY.label}>Full Name</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.name || user?.fullName || 'Not specified'}</span>
              </p>
            </div>

            {/* Email Address */}
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border space-y-1"
            >
              <span className={TYPOGRAPHY.label}>Email Address</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>{user?.email || 'Not specified'}</span>
              </p>
            </div>

            {/* User Role */}
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border space-y-1"
            >
              <span className={TYPOGRAPHY.label}>System User Role</span>
              <p className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>{user?.role_id || user?.role || 'System User'}</span>
              </p>
            </div>

            {/* User ID */}
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border space-y-1"
            >
              <span className={TYPOGRAPHY.label}>User Identifier</span>
              <p className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>#{user?.user_id || user?.id || '1'}</span>
              </p>
            </div>
          </div>

          {/* Bearer Token Box */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Active Authorization Token</span>
              </span>
              <button
                onClick={handleCopyToken}
                style={{
                  backgroundColor: copiedToken ? COLORS.successLight : COLORS.background,
                  borderColor: copiedToken ? '#A7F3D0' : COLORS.border,
                  color: copiedToken ? COLORS.success : COLORS.muted,
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all hover:bg-slate-100 cursor-pointer"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3 rounded-xl border font-mono text-[11px] text-slate-600 break-all select-all leading-relaxed"
            >
              {token ? `Bearer ${token}` : 'No active Authorization token found.'}
            </div>
          </div>
        </div>

        {/* Right Col: System & Branch Assignment Overview */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
          className="rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: COLORS.border }}>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1E3A8A]" />
                <span>Assignment & Activity</span>
              </h2>
              <Badge variant="blue" icon={Sparkles}>
                Live Profile
              </Badge>
            </div>

            {/* Branch Assignment Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" /> Branch Location
              </span>
              <p className="text-xs font-bold text-slate-800">
                Branch #{user?.branch_id || '1'}
              </p>
            </div>

            {/* Account Status Card */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Session Status
              </span>
              <p className="text-xs font-bold text-emerald-800">
                {user?.status || 'ACTIVE'} • Authenticated
              </p>
            </div>

            {/* Registration Metadata */}
            {formattedCreatedAt && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Member Since
                </span>
                <p className="text-xs font-semibold text-slate-700">{formattedCreatedAt}</p>
              </div>
            )}

            {formattedUpdatedAt && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Last Updated
                </span>
                <p className="text-xs font-semibold text-slate-700">{formattedUpdatedAt}</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t text-[11px] text-slate-400" style={{ borderColor: COLORS.border }}>
            Security Scheme: <span className="font-mono font-semibold text-slate-600">Bearer Token (JWT)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
