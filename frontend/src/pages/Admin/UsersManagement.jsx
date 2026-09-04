import React from 'react';
import useAdminUsers from '../../hooks/Admin/Users/useAdminUsers';
import UserAddModal from '../../components/Modals/Admin/UserAddModal';
import UserUpdateModal from '../../components/Modals/Admin/UserUpdateModal';
import UserDetailModal from '../../components/Modals/Admin/UserDetailModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Server,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function UsersManagement() {
  const {
    filteredUsers,
    apiLoading,
    error,
    totalCount,
    activeCount,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingUser,
    setEditingUser,
    detailUser,
    setDetailUser,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDelete,
  } = useAdminUsers();

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            backgroundColor: toast.type === 'error' ? COLORS.secondaryDark : COLORS.foreground,
            color: toast.type === 'error' ? COLORS.secondaryBorder : '#34D399',
          }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-bold animate-bounce"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Packed Header Card */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div
            style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0"
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={TYPOGRAPHY.h2}>System User Accounts</h1>
              <Badge variant="red" icon={Sparkles}>
                CRM Users API
              </Badge>
            </div>
            <p className={TYPOGRAPHY.subheading}>
              Manage user accounts, roles & status via Edugate Vercel API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
            className="p-2 rounded-xl border hover:bg-slate-100 transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-[#1E3A8A]' : ''}`} />
          </button>
          <Button variant="secondary" icon={UserPlus} onClick={() => setIsAddOpen(true)}>
            Add New User
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Total Users</p>
            <p style={{ color: COLORS.primary }} className="text-2xl font-extrabold mt-0.5">
              {totalCount}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Active Accounts</p>
            <p style={{ color: COLORS.success }} className="text-2xl font-extrabold mt-0.5">
              {activeCount}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.successLight, color: COLORS.success }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Live API</p>
            <p style={{ color: COLORS.secondary }} className="text-xs font-bold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Users Connected
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.secondaryLight, color: COLORS.secondary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-3.5 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center"
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
            className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* Find By User ID Form */}
        <form onSubmit={handleFindById} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="User ID (e.g. 1)"
            value={findIdInput}
            onChange={(e) => setFindIdInput(e.target.value)}
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
            className="px-3 py-1.5 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] w-full md:w-44"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isFinding || !findIdInput.trim()}
            icon={isFinding ? Loader2 : Eye}
            size="sm"
          >
            Find
          </Button>
        </form>
      </div>

      {/* Table Container */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl border shadow-sm overflow-hidden"
      >
        {error && (
          <div
            style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
            className="p-3 border-b text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {apiLoading && filteredUsers?.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.muted }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
            <p className="font-semibold text-xs">Loading User Accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>No User Accounts Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
                  className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Branch / Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u, index) => (
                  <tr key={u.user_id || u.id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        style={{
                          backgroundColor: COLORS.primaryLight,
                          color: COLORS.primary,
                          borderColor: COLORS.primaryBorder,
                        }}
                        className="px-2 py-0.5 rounded-md border text-[11px]"
                      >
                        #{u.user_id || u.id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold" style={{ color: COLORS.foreground }}>{u.name}</p>
                      <p className="text-[11px]" style={{ color: COLORS.muted }}>{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <Building2 className="w-3 h-3 text-slate-400" /> B#{u.branch_id || 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" /> R#{u.role_id || 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={u.status === 'INACTIVE' ? 'red' : 'green'}
                        icon={CheckCircle2}
                      >
                        {u.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setDetailUser(u)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingUser(u)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#D97706] hover:bg-amber-50 transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.user_id || u.id)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <UserUpdateModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <UserDetailModal
        isOpen={!!detailUser}
        user={detailUser}
        onClose={() => setDetailUser(null)}
      />
    </div>
  );
}
