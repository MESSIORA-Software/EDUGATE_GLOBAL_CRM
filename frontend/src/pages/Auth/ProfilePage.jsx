import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from '../../hooks/Auth/useAuth';
import { fetchBranches } from '../../actions/Admin/branchAction';
import UserUpdateModal from '../../components/Modals/Admin/User/UserUpdateModal';
import ChangePasswordModal from '../../components/Modals/Auth/ChangePasswordModal';
import {
  User,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Shield,
  Hash,
  Lock,
  Copy,
  Check,
  Edit3,
  Kanban,
  HardDrive,
  MessageSquare,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, token, loading, fetchProfile } = useAuth();
  const { list: branches = [] } = useSelector((state) => state.branch ?? {});

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'permissions' | 'security'
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPasswordDisplay, setCurrentPasswordDisplay] = useState(() => {
    try {
      return sessionStorage.getItem('current_user_pwd') || '1234';
    } catch {
      return '1234';
    }
  });
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!branches || branches.length === 0) {
      dispatch(fetchBranches());
    }
  }, [dispatch, branches]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefresh = async () => {
    const res = await fetchProfile(token);
    if (res?.success) {
      showToast('success', 'Profile refreshed successfully');
    } else {
      showToast('error', res?.error || 'Failed to refresh profile');
    }
  };

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCreatedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 18, 2026';

  const formattedUpdatedAt = user?.updated_at
    ? new Date(user.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const roleRaw = String(user?.role_name || user?.role_id || user?.role || 'SUPER_ADMIN').toUpperCase();
  const isSuperAdmin = roleRaw.includes('SUPER');
  const isAdmin = roleRaw.includes('ADMIN');
  const roleDisplay = isSuperAdmin ? 'Super Administrator' : isAdmin ? 'Administrator' : 'Staff Member';
  const displayName = user?.name || user?.fullName || 'Kamal';
  const userInitials = (displayName || 'U').charAt(0).toUpperCase();
  const userEmail = user?.email || 'kamal@example.com';
  const userId = user?.user_id || user?.id || '15';
  const formattedUserId = userId
    ? String(userId).startsWith('EDU_USER_')
      ? String(userId)
      : `EDU_USER_${userId}`
    : 'EDU_USER_15';

  const matchedBranch = branches?.find(
    (b) => String(b.branch_id || b.id) === String(user?.branch_id)
  );
  const branchName =
    user?.branch_name ||
    matchedBranch?.branch_name ||
    matchedBranch?.name ||
    (isSuperAdmin ? 'Global Headquarters (All Branches)' : 'Central Branch Office');

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Toast Notification */}
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

      {/* Page Header (Matches CRM Standard) */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Profile
            </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Personal profile credentials, branch affiliation, and platform permissions.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>

      {/* Profile Layout: Left Sidebar Card + Right Tabbed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: User Identity Card (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            {/* Profile Avatar & Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xl flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">{displayName}</h2>
                  <p className="text-xs font-medium text-slate-500">{roleDisplay}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

              {/* Email with 1-click Copy */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 font-medium truncate select-all">
                  {userEmail}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(userEmail)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                  title="Copy email address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Quick Metadata list */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                    <Building2 className="w-3.5 h-3.5" /> Branch
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {branchName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Member Since
                  </span>
                  <span className="font-semibold text-slate-800">{formattedCreatedAt}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Account ID
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{formattedUserId}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                <span>Update Account Details</span>
              </button>
            </div>
        </div>

        {/* Right Column: Structured Tabs & Details (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Clean Segmented Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'text-blue-900 bg-blue-50/70 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'permissions'
                  ? 'text-blue-900 bg-blue-50/70 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Permissions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'security'
                  ? 'text-blue-900 bg-blue-50/70 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security & Password</span>
            </button>
          </div>

          {/* Tab 1: Personal Details */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal & Work Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Your official account and communication credentials in the CRM.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Display Name</span>
                  <span className="font-semibold text-slate-900">{displayName}</span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Primary Email Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{userEmail}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Primary Office / Branch</span>
                  <span className="font-semibold text-slate-900">{branchName}</span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Assigned System Role</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    {roleDisplay}
                  </span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Working Timezone</span>
                  <span className="font-semibold text-slate-900">Asia/Colombo (GMT +05:30)</span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Profile Created</span>
                  <span className="font-semibold text-slate-900">{formattedCreatedAt}</span>
                </div>

                {formattedUpdatedAt && (
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium">Last Modified</span>
                    <span className="font-semibold text-slate-900">{formattedUpdatedAt}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Platform Permissions */}
          {activeTab === 'permissions' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Assigned Platform Privileges</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permissions governed by your role: <strong className="text-slate-800">{roleDisplay}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>User & Role Governance</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Provision staff logins, manage access tiers, and assign branch locations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Branch Operations</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Full management of regional offices, branch contacts, and staff rosters.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Student Pipeline & Clients</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Access to candidate applications, lead conversion stages, and client notes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Omnichannel Communications</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Real-time WhatsApp, Messenger, and Gmail messaging integration.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Media Vault & Attachments</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Cloud document storage for transcripts, passports, and visa files.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Events & Calendar Scheduling</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-6">
                    Create meetings, assign staff counselors, and dispatch reminders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage your login password and account credentials.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Password card */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Account Password</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-800 font-mono text-xs font-semibold tracking-wider select-all">
                          {showPassword ? currentPasswordDisplay : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={showPassword ? 'Hide password' : 'View password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {showPassword
                          ? 'Active password for current login session.'
                          : 'Click the eye icon to view your password.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-blue-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {isEditOpen && (
        <UserUpdateModal
          isOpen={isEditOpen}
          user={user}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            showToast('success', 'Profile updated successfully');
            fetchProfile(token);
          }}
        />
      )}

      {/* Change Password Side Popup Drawer */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          user={user}
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={(newPassword, message) => {
            setCurrentPasswordDisplay(newPassword);
            showToast('success', message || 'Password updated successfully');
            fetchProfile(token);
          }}
        />
      )}
    </div>
  );
}
