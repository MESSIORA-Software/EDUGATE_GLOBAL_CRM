import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPipelineData } from '../../actions/Admin/pipelineAction';
import useClients from '../../hooks/Admin/Clients/useClients';
import ClientAddModal from '../../components/Modals/Admin/Student/ClientAddModal';
import ClientUpdateModal from '../../components/Modals/Admin/Student/ClientUpdateModal';
import ClientDetailModal from '../../components/Modals/Admin/Student/ClientDetailModal';
import ClientDeleteModal from '../../components/Modals/Admin/Student/ClientDeleteModal';
import CreateOpportunityModal from '../../components/Modals/Admin/Student/CreateOpportunityModal';

import {
  UserCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Target,
  Check,
  Filter,
  ChevronDown,
  Award,
} from 'lucide-react';

export default function ClientsManagement() {
  const dispatch = useDispatch();
  const [opportunityClient, setOpportunityClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const { opportunities = [] } = useSelector((state) => state.pipeline ?? {});

  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);

  const opportunityClientIds = useMemo(() => {
    return new Set(opportunities.map((opp) => Number(opp.client_id)));
  }, [opportunities]);

  const {
    filteredClients,
    apiLoading,
    error,
    searchTerm,
    setSearchTerm,
    isAddOpen,
    setIsAddOpen,
    editingClient,
    setEditingClient,
    detailClient,
    setDetailClient,
    toast,
    showToast,
    handleRefresh,
  } = useClients();

  // Filter clients based on search and opportunity filter
  const displayedClients = useMemo(() => {
    return (filteredClients || []).filter((c) => {
      const hasOpportunity = opportunityClientIds.has(Number(c.client_id));
      if (selectedFilter === 'OPPORTUNITY') return hasOpportunity;
      if (selectedFilter === 'INQUIRY') return !hasOpportunity;
      return true;
    });
  }, [filteredClients, opportunityClientIds, selectedFilter]);

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
            Students & Clients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage student client profiles, study abroad inquiries, and academic application records.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={() => {
              handleRefresh();
              dispatch(fetchPipelineData());
            }}
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
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row gap-3 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-80 group">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              name="students_search_filter_control"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              placeholder="Search by student name, email, source..."
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

          <div className="relative w-full sm:w-48">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none w-full pl-8 pr-8 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs"
            >
              <option value="ALL">All Students</option>
              <option value="OPPORTUNITY">In Opportunity</option>
              <option value="INQUIRY">Inquiries Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
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

        {apiLoading && displayedClients?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-xs">Loading Students...</p>
          </div>
        ) : displayedClients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No Students Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Lead Source</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedClients.map((c, index) => {
                  const hasOpportunity = opportunityClientIds.has(Number(c.client_id));
                  const initials = (c.name || 'ST').substring(0, 2).toUpperCase();
                  const formattedClientId = c.client_id
                    ? String(c.client_id).startsWith('EDU_STUDENT_')
                      ? c.client_id
                      : `EDU_STUDENT_${c.client_id}`
                    : 'N/A';

                  return (
                    <tr key={c.client_id || index} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1st Column: Student ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {formattedClientId}
                        </span>
                      </td>

                      {/* 2nd Column: Student Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-[11px] text-slate-500">{c.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* 3rd Column: Lead Source */}
                      <td className="py-3.5 px-4">
                        {c.referrers || c.source?.toLowerCase().includes('referee') || c.referrer_id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                              <Award className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Referee: {c.referrers?.name || c.source || 'Assigned Referee'}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-800">
                            {c.source || 'Direct Contact'}
                          </span>
                        )}
                      </td>

                      {/* 4th Column: Pipeline Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasOpportunity ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            In Opportunity
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOpportunityClient(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border border-blue-300 bg-blue-50/40 text-blue-900 hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                          >
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                            <span>Create Opportunity</span>
                          </button>
                        )}
                      </td>

                      {/* 5th Column: Date Added */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {c.created_at ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(c.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          'Active'
                        )}
                      </td>

                      {/* 6th Column: Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setDetailClient(c)}
                          className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingClient(c)}
                          className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(c)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                          title="Delete Student"
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
      <ClientAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      <ClientUpdateModal
        isOpen={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      <ClientDetailModal
        isOpen={!!detailClient}
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onEdit={(c) => setEditingClient(c)}
      />

      <ClientDeleteModal
        isOpen={!!deletingClient}
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      {opportunityClient && (
        <CreateOpportunityModal
          isOpen={true}
          client={opportunityClient}
          preselectedClientId={opportunityClient.client_id}
          onClose={() => setOpportunityClient(null)}
          onSuccess={(msg) => {
            showToast(msg || 'Opportunity created successfully!');
            dispatch(fetchPipelineData());
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
