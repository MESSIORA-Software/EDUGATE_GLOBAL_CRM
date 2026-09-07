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
  Code,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
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

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Title */}
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
              <h1 className="text-xl font-extrabold text-slate-800">
                {user?.name || 'My Profile'}
              </h1>
              <Badge variant="green" icon={CheckCircle2}>
                {user?.status || 'Active Session'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Profile endpoint: <span className="font-mono text-slate-600 font-semibold">POST /api/auth/viewmyprofile</span>
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
            backgroundColor: refreshMessage.type === 'success' ? COLORS.successLight : COLORS.dangerLight,
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
        {/* Left 2 Cols: Details Card */}
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
              <span>User Information</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Find By ID Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border"
            >
              <span className={TYPOGRAPHY.label}>Full Name</span>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {user?.name || user?.fullName || 'Not specified'}
              </p>
            </div>

            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border"
            >
              <span className={TYPOGRAPHY.label}>Email Address</span>
              <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'Not specified'}</span>
              </p>
            </div>

            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border"
            >
              <span className={TYPOGRAPHY.label}>User Role</span>
              <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>{user?.role || user?.role_name || 'System User'}</span>
              </p>
            </div>

            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="p-3.5 rounded-xl border"
            >
              <span className={TYPOGRAPHY.label}>User ID / Service No</span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                {user?.user_id || user?.serviceNo || user?.id || 'ADM001'}
              </p>
            </div>
          </div>

          {/* Bearer Token Box */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Active Bearer Token (Authorization Tab)</span>
              </span>
              <button
                onClick={handleCopyToken}
                style={{
                  backgroundColor: copiedToken ? COLORS.successLight : COLORS.background,
                  borderColor: copiedToken ? '#A7F3D0' : COLORS.border,
                  color: copiedToken ? COLORS.success : COLORS.muted,
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all hover:bg-slate-100"
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
              {token ? `Bearer ${token}` : 'No active Bearer token found.'}
            </div>
          </div>
        </div>

        {/* Right Col: Live Raw JSON Response */}
        <div
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
          className="rounded-2xl border p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: COLORS.border }}>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#1E3A8A]" />
                <span>API Payload</span>
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-md">
                JSON
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Profile object retrieved from <span className="font-semibold text-slate-700">viewmyprofile</span>:
            </p>
            <pre
              style={{ backgroundColor: '#0F172A', color: '#34D399' }}
              className="p-3 rounded-xl text-[10px] font-mono overflow-x-auto border border-slate-800 shadow-inner max-h-72 leading-relaxed"
            >
              {JSON.stringify(user || { message: 'No profile data loaded' }, null, 2)}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t text-[11px] text-slate-400" style={{ borderColor: COLORS.border }}>
            Authorization: <span className="font-mono text-slate-600">Bearer Token</span>
          </div>
        </div>
      </div>
    </div>
  );
}
