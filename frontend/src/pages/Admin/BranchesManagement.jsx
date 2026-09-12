import React from 'react';
import useBranches from '../../hooks/Admin/Branches/useBranches';
import BranchAddModal from '../../components/Modals/Admin/Branch/BranchAddModal';
import BranchUpdateModal from '../../components/Modals/Admin/Branch/BranchUpdateModal';
import BranchDetailModal from '../../components/Modals/Admin/Branch/BranchDetailModal';
import BranchUsersModal from '../../components/Modals/Admin/Branch/BranchUsersModal';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
  Server,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function BranchesManagement() {
  const {
    filteredBranches,
    apiLoading,
    error,
    totalCount,
    activeCount,
    searchTerm,
    setSearchTerm,
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingBranch,
    setEditingBranch,
    detailBranch,
    setDetailBranch,
    usersBranch,
    setUsersBranch,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDeleteBranch,
    handleViewBranchUsers,
    getBadgeCode,
  } = useBranches();

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

      {/* Header Card */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div
            style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0"
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={TYPOGRAPHY.h2}>Branch Locations Management</h1>
              <Badge variant="red" icon={Sparkles}>
                CRM Branches API
              </Badge>
            </div>
            <p className={TYPOGRAPHY.subheading}>
              Manage regional CRM branches and location staff via Edugate Vercel API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
            className="p-2 rounded-xl border hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Branches"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-[#1E3A8A]' : ''}`} />
          </button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add New Branch
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
            <p className={TYPOGRAPHY.label}>Total Branches</p>
            <p style={{ color: COLORS.primary }} className="text-2xl font-extrabold mt-0.5">
              {totalCount}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Active Locations</p>
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
            placeholder="Filter branch name, address, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
              color: COLORS.foreground,
            }}
            className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>

        {/* Find By Branch ID Form (API #3) */}
        <form onSubmit={handleFindById} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Branch ID (e.g. 1)"
            value={findIdInput}
            onChange={(e) => setFindIdInput(e.target.value)}
            style={{
              backgroundColor: COLORS.background,
              borderColor: COLORS.border,
              color: COLORS.foreground,
            }}
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
            style={{
              backgroundColor: COLORS.secondaryLight,
              borderColor: COLORS.secondaryBorder,
              color: COLORS.secondary,
            }}
            className="p-3 border-b text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {apiLoading && filteredBranches?.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.muted }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
            <p className="font-semibold text-xs">Loading Branches...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
            <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>
              No Branches Found
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add New Branch" to create your first branch.'}
            </p>
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
                  <th className="py-3 px-4">Branch Details</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBranches.map((b, index) => {
                  const branchId = b.branch_id || b.id || index + 1;
                  const badgeCode = getBadgeCode(b.name);

                  return (
                    <tr key={branchId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">
                        <span
                          style={{
                            backgroundColor: COLORS.primaryLight,
                            color: COLORS.primary,
                            borderColor: COLORS.primaryBorder,
                          }}
                          className="px-2 py-0.5 rounded-md border text-[11px]"
                        >
                          #{branchId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              backgroundColor: '#F1F5F9',
                              color: COLORS.primaryDark,
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase shrink-0 border border-slate-200"
                          >
                            {badgeCode}
                          </span>
                          <div>
                            <p className="font-bold" style={{ color: COLORS.foreground }}>
                              {b.name || 'Unnamed Branch'}
                            </p>
                            <span className="text-[10px] text-slate-400">Branch Office</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 max-w-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{b.address || 'No address specified'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{b.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="green" icon={CheckCircle2}>
                          Active
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* View Details (API #3) */}
                        <button
                          onClick={() => setDetailBranch(b)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Branch Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* View Users (API #6) */}
                        <button
                          onClick={() => handleViewBranchUsers(b)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Branch Users"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit Branch (API #4) */}
                        <button
                          onClick={() => setEditingBranch(b)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-[#D97706] hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete Branch (API #5) */}
                        <button
                          onClick={() => handleDeleteBranch(branchId, b.name)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Modals */}
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
        onViewUsers={(b) => handleViewBranchUsers(b)}
      />

      <BranchUsersModal
        isOpen={!!usersBranch}
        branch={usersBranch}
        onClose={() => setUsersBranch(null)}
      />
    </div>
  );
}
