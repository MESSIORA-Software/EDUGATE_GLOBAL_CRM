import React from 'react';
import useBranches from '../../hooks/Admin/Branches/useBranches';
import BranchAddModal from '../../components/Modals/Admin/Branch/BranchAddModal';
import BranchUpdateModal from '../../components/Modals/Admin/Branch/BranchUpdateModal';
import BranchDetailModal from '../../components/Modals/Admin/Branch/BranchDetailModal';
import BranchUsersModal from '../../components/Modals/Admin/Branch/BranchUsersModal';
import BranchDeleteModal from '../../components/Modals/Admin/Branch/BranchDeleteModal';

import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Users,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

export default function BranchesManagement() {
  const {
    filteredBranches,
    apiLoading,
    error,
    searchTerm,
    setSearchTerm,
    isAddOpen,
    setIsAddOpen,
    editingBranch,
    setEditingBranch,
    detailBranch,
    setDetailBranch,
    usersBranch,
    setUsersBranch,
    deletingBranch,
    setDeletingBranch,
    toast,
    showToast,
    handleRefresh,
    handleDeleteBranch,
    handleViewBranchUsers,
    getBadgeCode,
  } = useBranches();

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

            {/* Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Branch Locations
            </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage global offices, regional branch locations, and staff assignments.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80 group">
          <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-all cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {apiLoading && filteredBranches?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-xs">Loading Branches...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No Branches Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Branch ID</th>
                  <th className="py-3.5 px-4">Branch Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBranches.map((b, index) => {
                  const branchName = b.branch_name || b.name || `Branch #${b.branch_id || index + 1}`;
                  const badge = getBadgeCode(branchName);

                  return (
                    <tr key={b.branch_id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className="px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50/50 text-blue-800 text-[11px]">
                          {badge}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{branchName}</p>
                        {b.address && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{b.address}</span>
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.phone ? (
                          <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {b.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No phone</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {b.status || 'Active'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setDetailBranch(b)}
                          className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingBranch(b)}
                          className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-colors cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBranch(b)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <BranchAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <BranchUpdateModal
        isOpen={!!editingBranch}
        branch={editingBranch}
        onClose={() => setEditingBranch(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <BranchDetailModal
        isOpen={!!detailBranch}
        branch={detailBranch}
        onClose={() => setDetailBranch(null)}
        onEdit={(b) => {
          setDetailBranch(null);
          setEditingBranch(b);
        }}
      />

      <BranchUsersModal
        isOpen={!!usersBranch}
        branch={usersBranch}
        onClose={() => setUsersBranch(null)}
      />

      <BranchDeleteModal
        isOpen={!!deletingBranch}
        branch={deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
