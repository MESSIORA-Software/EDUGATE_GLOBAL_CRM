import React from 'react';
import useAdminRoles from '../../hooks/Admin/Roles/useAdminRoles';
import RoleAddModal from '../../components/Modals/Admin/RoleAddModal';
import RoleUpdateModal from '../../components/Modals/Admin/RoleUpdateModal';
import RoleDetailModal from '../../components/Modals/Admin/RoleDetailModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

import {
  Shield,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function RolesManagement() {
  const {
    filteredRoles,
    apiLoading,
    error,
    totalCount,
    searchTerm,
    setSearchTerm,
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingRole,
    setEditingRole,
    detailRole,
    setDetailRole,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDelete,
  } = useAdminRoles();

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
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={TYPOGRAPHY.h2}>System Roles Management</h1>
              <Badge variant="red" icon={Sparkles}>
                CRM Redux API
              </Badge>
            </div>
            <p className={TYPOGRAPHY.subheading}>
              Configure user role definitions via Edugate Vercel API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
            className="p-2 rounded-xl border hover:bg-slate-100 transition-colors"
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-[#1E3A8A]' : ''}`} />
          </button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add New Role
          </Button>
        </div>
      </div>

      {/* High Density Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Total Roles</p>
            <p style={{ color: COLORS.primary }} className="text-2xl font-extrabold mt-0.5">
              {totalCount}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>API Status</p>
            <p style={{ color: COLORS.success }} className="text-xs font-bold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected Live
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.successLight, color: COLORS.success }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Primary Role</p>
            <p style={{ color: COLORS.secondary }} className="text-sm font-bold font-mono mt-0.5">
              ADMIN
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.secondaryLight, color: COLORS.secondary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-3.5 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center"
      >
        <div className="relative w-full md:w-72">
          <Search style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
            className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>

        <form onSubmit={handleFindById} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Role ID (e.g. ADMIN)"
            value={findIdInput}
            onChange={(e) => setFindIdInput(e.target.value)}
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
            className="px-3 py-1.5 border rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] w-full md:w-48"
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

        {apiLoading && filteredRoles?.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.muted }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
            <p className="font-semibold text-xs">Loading Roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
            <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>No Roles Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
                  className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  <th className="py-3 px-4">Role ID</th>
                  <th className="py-3 px-4">Role Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoles.map((r, index) => (
                  <tr key={r.role_id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        style={{
                          backgroundColor: COLORS.primaryLight,
                          color: COLORS.primary,
                          borderColor: COLORS.primaryBorder,
                        }}
                        className="px-2 py-0.5 rounded-md border text-[11px]"
                      >
                        {r.role_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold" style={{ color: COLORS.foreground }}>
                      {r.role_name}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="green" icon={CheckCircle2}>
                        Active
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setDetailRole(r)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingRole(r)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#D97706] hover:bg-amber-50 transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.role_id)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Role"
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
      <RoleAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <RoleUpdateModal
        isOpen={!!editingRole}
        role={editingRole}
        onClose={() => setEditingRole(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <RoleDetailModal
        isOpen={!!detailRole}
        role={detailRole}
        onClose={() => setDetailRole(null)}
      />
    </div>
  );
}
