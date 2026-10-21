import React from 'react';
import useEvent, { formatEventId } from '../../hooks/Admin/Event/useEvent';
import EventAddModal from '../../components/Modals/Admin/Event/EventAddModal';
import EventUpdateModal from '../../components/Modals/Admin/Event/EventUpdateModal';
import EventDetailModal from '../../components/Modals/Admin/Event/EventDetailModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  AlignLeft,
  X,
} from 'lucide-react';

export default function EventManagement() {
  const {
    filteredEvents,
    apiLoading,
    error,
    totalCount,
    searchTerm,
    setSearchTerm,
    findIdInput,
    setFindIdInput,
    isFinding,
    handleFindById,
    isAddOpen,
    setIsAddOpen,
    editingEvent,
    setEditingEvent,
    detailEvent,
    setDetailEvent,
    submitting,
    toast,
    showToast,
    handleRefresh,
    handleAddEvent,
    handleUpdateEvent,
    handleDeleteEvent,
  } = useEvent();

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

      {/* Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Events Management
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount || 0} Events
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage meetings, tasks, and calendar events for staff and clients.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Events"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center"
      >
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* General Search */}
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 text-blue-600 group-focus-within:text-[#1E3A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search events by title or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: COLORS.background,
                borderColor: COLORS.border,
                color: COLORS.foreground,
              }}
              className="w-full pl-10 pr-12 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E3A8A] focus:bg-white transition-all shadow-2xs hover:border-slate-300"
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

          <div className="hidden md:block h-6 w-[1px] bg-slate-200"></div>

          {/* Find By Event ID Form */}
          <form onSubmit={handleFindById} className="flex items-center w-full md:w-auto relative group">
            <div className="relative flex-1 md:w-64">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200/80 pointer-events-none select-none">
                ID
              </span>
              <input
                type="text"
                placeholder="e.g. EDG-0001"
                value={findIdInput}
                onChange={(e) => setFindIdInput(e.target.value)}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  color: COLORS.foreground,
                }}
                className="w-full pl-11 pr-20 py-2 border rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs hover:border-slate-300"
              />
              {findIdInput && (
                <button
                  type="button"
                  onClick={() => setFindIdInput('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                  title="Clear ID search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isFinding || !findIdInput.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-[#1E3A8A] hover:text-white text-slate-700 rounded-lg text-[10.5px] font-bold tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 disabled:cursor-not-allowed flex items-center gap-1 border border-slate-200 cursor-pointer shadow-2xs active:scale-95"
              >
                {isFinding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                <span>FIND</span>
              </button>
            </div>
          </form>
        </div>

        <div className="text-xs font-medium text-slate-500 hidden lg:block px-2">
          Showing <span className="font-bold text-slate-700">{filteredEvents.length}</span> of <span className="font-bold text-slate-700">{totalCount}</span> events
        </div>
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

        {apiLoading && filteredEvents?.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.muted }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
            <p className="font-semibold text-xs">Loading Events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
            <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>
              No Events Found
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
              {searchTerm || findIdInput ? 'Try adjusting your search query' : 'Click "Create Event" to schedule your first meeting.'}
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
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Assignments</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEvents.map((e) => (
                  <tr key={e.event_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 tracking-wider">
                          {formatEventId(e.event_id)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 leading-snug truncate">
                            {e.title}
                          </p>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 max-w-md truncate">
                            <AlignLeft className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{e.reason}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{e.event_date}</div>
                      {(e.start_time || e.end_time) && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {e.start_time?.slice(0, 5) || '--'} to {e.end_time?.slice(0, 5) || '--'}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      {e.assigned_staff ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          {e.assigned_staff.name || e.assigned_staff.email}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Unassigned Staff</div>
                      )}
                      {e.client && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-emerald-500" />
                          Client: {e.client.name}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setDetailEvent(e)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Event Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingEvent(e)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-[#D97706] hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(e.event_id, e.title)}
                        style={{ color: COLORS.muted, borderColor: COLORS.border }}
                        className="p-1.5 rounded-lg border hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Event"
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
      <EventAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
        handleAddEvent={handleAddEvent}
        submitting={submitting}
      />

      <EventUpdateModal
        isOpen={!!editingEvent}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={(msg) => showToast(msg)}
        handleUpdateEvent={handleUpdateEvent}
        submitting={submitting}
      />

      <EventDetailModal
        isOpen={!!detailEvent}
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onEdit={(e) => setEditingEvent(e)}
      />
    </div>
  );
}
