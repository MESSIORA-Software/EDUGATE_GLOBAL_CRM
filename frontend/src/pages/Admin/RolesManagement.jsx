import React from 'react';
import useAdminRoles from '../../hooks/Admin/Roles/useAdminRoles';
import RoleAddModal from '../../components/Modals/Admin/Role/RoleAddModal';
import RoleUpdateModal from '../../components/Modals/Admin/Role/RoleUpdateModal';
import RoleDetailModal from '../../components/Modals/Admin/Role/RoleDetailModal';

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

      {/* Clean Corporate Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              System Roles Management
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount} Total Roles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Configure system permissions, user role definitions and access tiers.
          </p>
        </div>

        {/* Toolbar Controls (Aligned to Right Side) */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Add New Role Button (Blue Theme Border) */}
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Role</span>
          </button>
        </div>
      </div>

      {/* High Density Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total System Roles</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
              {totalCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">API Status</p>
            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected Live
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-red-200/80 shadow-2xs hover:border-red-500 transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Primary Role</p>
            <p className="text-sm font-bold font-mono text-red-900 mt-0.5">
              ADMIN
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <form onSubmit={handleFindById} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Role ID (e.g. ADMIN)"
            value={findIdInput}
            onChange={(e) => setFindIdInput(e.target.value)}
            className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-mono uppercase text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-48"
          />
          <button
            type="submit"
            disabled={isFinding || !findIdInput.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer disabled:opacity-50"
          >
            {isFinding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
            <span>Find</span>
          </button>
        </form>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {apiLoading && filteredRoles?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-xs">Loading Roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No Roles Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Role ID</th>
                  <th className="py-3.5 px-4">Role Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoles.map((r, index) => (
                  <tr key={r.role_id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50/50 text-blue-800 text-[11px]">
                        #{r.role_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {r.role_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setDetailRole(r)}
                        className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingRole(r)}
                        className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-colors cursor-pointer"
                        title="Edit Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.role_id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
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
