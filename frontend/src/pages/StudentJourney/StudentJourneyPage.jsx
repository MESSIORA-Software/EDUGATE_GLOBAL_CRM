import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../../hooks/Auth/useAuth';
import { getUserRole } from '../../utils/roleUtils';
import studentJourneyService from '../../services/StudentJourney/studentJourneyService';
import userService from '../../services/Admin/userService';
import JourneySpreadsheetTable from '../../components/StudentJourney/JourneySpreadsheetTable';
import StudentJourneyDrawer from '../../components/StudentJourney/StudentJourneyDrawer';
import ManageColumnsModal from '../../components/StudentJourney/ManageColumnsModal';

import {
  Search,
  Filter,
  Sliders,
  RefreshCw,
  Calendar,
  User,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

export default function StudentJourneyPage() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Table Data State
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Load active columns
  const loadColumns = useCallback(async () => {
    try {
      const cols = await studentJourneyService.getColumns();
      setColumns(cols || []);
    } catch (err) {
      console.error('Failed to load columns:', err);
    }
  }, []);

  // 2. Load staff list for filter dropdown (if admin)
  const loadStaffUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await userService.getAllUsers();
      const users = res?.data || res || [];
      setStaffList(Array.isArray(users) ? users : []);
    } catch (err) {
      console.warn('Could not load staff users for filter:', err);
    }
  }, [isAdmin]);

  // 3. Load paginated student journey records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: appliedSearch,
        staff_id: selectedStaff || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const res = await studentJourneyService.getRecords(params);
      setRecords(res.records || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || Math.ceil((res.total || 0) / limit) || 1);
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Failed to fetch student journey records', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedSearch, selectedStaff, startDate, endDate]);

  useEffect(() => {
    loadColumns();
    loadStaffUsers();
  }, [loadColumns, loadStaffUsers]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  // Handle Excel Export
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await studentJourneyService.exportExcel({
        search: appliedSearch,
        staff_id: selectedStaff || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      showToast('Excel report downloaded successfully!');
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Excel export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Callback when student values are updated in Drawer
  const handleSaveSuccess = (clientId, newValues) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.client_id === clientId
          ? { ...rec, values: { ...rec.values, ...newValues } }
          : rec
      )
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedStaff('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(appliedSearch || selectedStaff || startDate || endDate);

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
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Student Journey
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                University Applications · Documents · Finance · Visa Progress
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls (Matching Student Pipeline Button Styling) */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchRecords();
            }}
            disabled={loading}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Journey Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Manage Columns Button (Red Theme Border - Matching Manage Pipeline in Student Pipeline) */}
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsColumnModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 bg-red-50/40 text-red-900 text-xs font-semibold hover:bg-red-50 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-red-600" />
              <span>Manage Columns</span>
            </button>
          )}

          {/* Export As Excel Button (Emerald Theme Border - Matching Student Pipeline) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleExportExcel();
            }}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer shadow-2xs"
            title="Export Student Journey to Excel"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Export As Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or student ID (EDU_STUDENT_...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-colors"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Assigned Staff Filter (Admins only) */}
          {isAdmin && staffList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Staff Members</option>
                {staffList.map((st) => (
                  <option key={st.user_id} value={st.user_id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date range filters */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              title="Start Date"
              className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              title="End Date"
              className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Table Component */}
      <JourneySpreadsheetTable
        records={records}
        columns={columns}
        loading={loading}
        onRowClick={(student) => setActiveStudent(student)}
      />

      {/* Pagination Controls */}
      {!loading && records.length > 0 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(page * limit, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{totalCount}</span> students
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Journey Slide-over Drawer */}
      <StudentJourneyDrawer
        isOpen={Boolean(activeStudent)}
        student={activeStudent}
        columns={columns}
        onClose={() => setActiveStudent(null)}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Administrator Column Manager Modal */}
      {isAdmin && (
        <ManageColumnsModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onColumnsChanged={() => {
            loadColumns();
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
