import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPipelineData } from '../../actions/Admin/pipelineAction';
import useClients from '../../hooks/Admin/Clients/useClients';
import ClientAddModal from '../../components/Modals/Admin/Student/ClientAddModal';
import ClientUpdateModal from '../../components/Modals/Admin/Student/ClientUpdateModal';
import ClientDetailModal from '../../components/Modals/Admin/Student/ClientDetailModal';
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
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  Check,
} from 'lucide-react';

export default function ClientsManagement() {
  const dispatch = useDispatch();
  const [opportunityClient, setOpportunityClient] = useState(null);
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
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingClient,
    setEditingClient,
    detailClient,
    setDetailClient,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDeleteClient,
  } = useClients();

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
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Students & Clients
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredClients?.length || 0} Students
            </span>
          </div>
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
      <div className="p-3.5 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email, program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-end flex-wrap gap-2.5 w-full md:w-auto">
          <form onSubmit={handleFindById} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Student ID (e.g. 1)"
              value={findIdInput}
              onChange={(e) => setFindIdInput(e.target.value)}
              className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-mono uppercase text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 w-36"
            />
            <button
              type="submit"
              disabled={isFinding || !findIdInput.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
            >
              {isFinding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
              <span>Find</span>
            </button>
          </form>

          {/* Refresh Button */}
          <button
            onClick={() => {
              handleRefresh();
              dispatch(fetchPipelineData());
            }}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Students"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Add New Client Button */}
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

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {apiLoading && filteredClients?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-xs">Loading Students...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">No Students Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Lead Source</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClients.map((c, index) => {
                  const hasOpportunity = opportunityClientIds.has(Number(c.client_id));
                  const initials = (c.name || 'ST').substring(0, 2).toUpperCase();

                  return (
                    <tr key={c.client_id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">{c.name}</p>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono border border-blue-200 bg-blue-50 text-blue-800">
                                {c.client_id}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{c.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          <Share2 className="w-3 h-3 text-blue-600" />
                          {c.source || 'Direct Contact'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {hasOpportunity ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            In Opportunity
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOpportunityClient(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50/40 text-blue-900 border border-blue-300 hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer shadow-2xs"
                          >
                            <Target className="w-3 h-3 text-blue-600" />
                            Create Opportunity
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {c.created_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
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
                      <td className="py-3.5 px-4 text-right space-x-1.5">
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
                          onClick={() => handleDeleteClient(c.client_id)}
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

      {/* Modals */}
      <ClientAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <ClientUpdateModal
        isOpen={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <ClientDetailModal
        isOpen={!!detailClient}
        client={detailClient}
        onClose={() => setDetailClient(null)}
      />

      {opportunityClient && (
        <CreateOpportunityModal
          isOpen={true}
          onClose={() => setOpportunityClient(null)}
          preselectedClientId={opportunityClient.client_id}
          onSuccess={(msg) => {
            showToast(msg || 'Opportunity created successfully!');
            dispatch(fetchPipelineData());
          }}
        />
      )}
    </div>
  );
}
