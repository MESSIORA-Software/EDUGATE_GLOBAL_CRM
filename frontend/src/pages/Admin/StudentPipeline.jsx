import React, { useState } from 'react';
import usePipeline from '../../hooks/Admin/Pipeline/usePipeline';
import ClientAddModal from '../../components/Modals/Admin/Student/ClientAddModal';
import ClientDetailModal from '../../components/Modals/Admin/Student/ClientDetailModal';
import ManagePipelineModal from '../../components/Modals/Admin/Pipeline/ManagePipelineModal';
import CreateOpportunityModal from '../../components/Modals/Admin/Student/CreateOpportunityModal';
import OpportunityNoteModal from '../../components/Modals/Admin/Student/OpportunityNoteModal';
import AssignStaffModal from '../../components/Modals/Admin/Student/AssignStaffModal';
import Button from '../../components/ui/Button';

import {
  Search,
  RefreshCw,
  Filter,
  MoreVertical,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Loader2,
  ChevronDown,
  Target,
  Sliders,
  Maximize2,
  X,
  StickyNote,
  UserCheck,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

// Status Theme Helper with professional, clean subtle indicators
function getStatusTheme(statusName = '', index = 0) {
  const name = statusName.toLowerCase();

  if (name.includes('applied') || (name.includes('lead') && !name.includes('progress'))) {
    return {
      dotBg: 'bg-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: FileText,
      subtitle: 'Applications submitted & new leads',
    };
  }

  if (name.includes('review') || name.includes('under review')) {
    return {
      dotBg: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: Layers,
      subtitle: 'Applications undergoing review',
    };
  }

  if (name.includes('interview') || name.includes('progress')) {
    return {
      dotBg: 'bg-sky-500',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: Calendar,
      subtitle: 'In progress or interview scheduled',
    };
  }

  if (name.includes('accept') || name.includes('won') || name.includes('closed')) {
    return {
      dotBg: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2,
      subtitle: 'Accepted or successfully closed deals',
    };
  }

  if (name.includes('reject') || name.includes('lost')) {
    return {
      dotBg: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: AlertCircle,
      subtitle: 'Archived or not progressing',
    };
  }

  const fallbacks = [
    {
      dotBg: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Layers,
      subtitle: 'Active opportunities in this stage',
    },
    {
      dotBg: 'bg-slate-500',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      icon: Sparkles,
      subtitle: 'Opportunities progressing in stage',
    },
  ];

  return fallbacks[index % fallbacks.length];
}

function getInitials(name = '') {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Subtle conversation channel icons
function getChannelIcons(sourceStr = '') {
  if (!sourceStr) return [];
  const lower = sourceStr.toLowerCase();
  const icons = [];

  if (lower.includes('messenger') || lower.includes('facebook') || lower.includes('fb')) {
    icons.push({
      id: 'messenger',
      title: 'Messenger',
      bg: 'bg-blue-600',
      icon: (
        <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.43 3.19 7.07.16.13.26.33.26.54l-.07 1.7c-.03.74.77 1.25 1.41.87l1.91-1.12c.16-.1.35-.13.54-.1.87.23 1.79.35 2.76.35 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.06 13.06l-2.58-2.75-5.04 2.75 5.54-5.88 2.65 2.75 4.97-2.75-5.54 5.88z" />
        </svg>
      ),
    });
  }

  if (lower.includes('whatsapp') || lower.includes('wa')) {
    icons.push({
      id: 'whatsapp',
      title: 'Whatsapp',
      bg: 'bg-emerald-600',
      icon: (
        <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.07c-.24.68-1.2 1.25-1.95 1.34-.51.06-1.17.09-3.39-.83-2.84-1.18-4.66-4.08-4.8-4.27-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.24-.25.53-.31.71-.31.18 0 .35 0 .5.01.16.01.37-.06.58.44.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.21 2.17 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.75 1.86.88.27.13.45.2.52.31.06.11.06.64-.18 1.32z" />
        </svg>
      ),
    });
  }

  if (lower.includes('email') || lower.includes('mail')) {
    icons.push({
      id: 'email',
      title: 'Email',
      bg: 'bg-purple-600',
      icon: (
        <svg className="w-2.5 h-2.5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    });
  }

  if (lower.includes('call') || lower.includes('phone') || lower.includes('message') || lower.includes('sms')) {
    icons.push({
      id: 'messages_calls',
      title: 'Messages & Phone calls',
      bg: 'bg-rose-600',
      icon: (
        <svg className="w-2.5 h-2.5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    });
  }

  return icons;
}

export default function StudentPipeline() {
  const {
    statuses,
    opportunities = [],
    columnsData,
    apiLoading,
    movingStudent,
    error,

    searchTerm,
    setSearchTerm,
    programFilter,
    setProgramFilter,
    programOptions,

    focusedStatusId,
    setFocusedStatusId,

    draggedOpportunity,
    dragOverStatusId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleMoveOpportunity,

    isAddStudentOpen,
    setIsAddStudentOpen,
    isManagePipelineOpen,
    setIsManagePipelineOpen,
    isCreateOppOpen,
    setIsCreateOppOpen,
    detailStudent,
    setDetailStudent,

    toast,
    showToast,
    handleRefresh,

    user,
    userRole,
    isSuperAdmin,
    isStaff,
  } = usePipeline();

  // View Mode: 'card' (Kanban) or 'table'
  const [viewMode, setViewMode] = useState('card');
  const [tableStatusFilter, setTableStatusFilter] = useState('All');

  // Active opportunity card action dropdown
  const [activeMenuOppId, setActiveMenuOppId] = useState(null);

  // Modals state
  const [noteModalOpp, setNoteModalOpp] = useState(null);
  const [assignStaffOpp, setAssignStaffOpp] = useState(null);

  const totalOpportunitiesCount = columnsData.reduce((acc, col) => acc + col.count, 0);
  const focusedStatus = statuses.find((s) => s.status_id === focusedStatusId);

  // Filtered opportunities for Table View
  const allFilteredOpportunities = React.useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return opportunities.filter((opp) => {
      const client = opp.client || {};
      const cId = String(opp.client_id || client.client_id || '');
      const oppId = String(opp.opportunity_id || '');
      const name = (client.name || '').toLowerCase();
      const email = (client.email || '').toLowerCase();
      const src = (client.source || '').toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        src.includes(search) ||
        cId.includes(search) ||
        oppId.includes(search);

      const matchesProgram =
        programFilter === 'All' || client.source === programFilter;

      const matchesStatus =
        tableStatusFilter === 'All' || String(opp.status_id) === String(tableStatusFilter);

      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [opportunities, searchTerm, programFilter, tableStatusFilter]);

  // Export Student Pipeline to Excel (.xls spreadsheet)
  const handleExportExcel = () => {
    const listToExport = opportunities && opportunities.length > 0 ? opportunities : [];

    if (listToExport.length === 0) {
      showToast({ type: 'error', message: 'No student opportunities found to export.' });
      return;
    }

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Student Pipeline</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
          td { border: 1px solid #E2E8F0; padding: 8px; font-size: 12px; }
          .badge { font-weight: bold; color: #1E3A8A; }
        </style>
      </head>
      <body>
        <h2>EDUGATE GLOBAL CRM - Student Pipeline Export</h2>
        <p>Export Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | Total Records: ${listToExport.length}</p>
        <table>
          <thead>
            <tr>
              <th>Opportunity ID</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Pipeline Stage</th>
              <th>Lead Source</th>
              <th>Assigned Staff</th>
              <th>Staff Email</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    listToExport.forEach((opp) => {
      const client = opp.client || {};
      const statusObj = statuses.find((s) => String(s.status_id) === String(opp.status_id));
      const stageName = statusObj ? statusObj.status_name : (opp.status_name || 'Active');
      const oppId = opp.opportunity_id ? `#OPP-${opp.opportunity_id}` : '';
      const clientId = client.client_id ? `#STD-${client.client_id}` : (opp.client_id || '');
      const studentName = client.name || 'Unnamed Student';
      const email = client.email || 'N/A';
      const phone = client.phone || client.contact_number || 'N/A';
      const source = client.source || 'Direct';
      const staffName = opp.staff_name || (opp.staff ? (opp.staff.name || opp.staff.email) : 'Unassigned');
      const staffEmail = opp.staff?.email || 'N/A';
      const dateCreated = formatDate(opp.created_at || client.created_at);

      tableHtml += `
        <tr>
          <td class="badge">${oppId}</td>
          <td>${clientId}</td>
          <td><strong>${studentName}</strong></td>
          <td>${email}</td>
          <td>${phone}</td>
          <td>${stageName}</td>
          <td>${source}</td>
          <td>${staffName}</td>
          <td>${staffEmail}</td>
          <td>${dateCreated}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date().toISOString().slice(0, 10);
    link.download = `Edugate_Student_Pipeline_${now}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({ type: 'success', message: `Exported ${listToExport.length} student records to Excel!` });
  };

  return (
    <div className="space-y-4 max-w-full mx-auto" onClick={() => setActiveMenuOppId(null)}>
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

      {/* Clean Corporate Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Student Pipeline
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Stages
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Track student opportunities across pipeline stages and conversation channels.
          </p>
        </div>

        {/* Toolbar Controls (Aligned to Right Side) */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Program Filter Dropdown (Blue Border Theme) */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 border border-blue-200 bg-white rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs"
            >
              <option value="All">All Programs</option>
              {programOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Add Opportunity Button (Blue Theme Border) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateOppOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Opportunity</span>
          </button>

          {/* Manage Pipeline Button (Red Theme Border) - Hidden for Staff */}
          {!isStaff && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsManagePipelineOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 bg-red-50/40 text-red-900 text-xs font-semibold hover:bg-red-50 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-red-600" />
              <span>Manage Pipeline</span>
            </button>
          )}

          {/* Export As Excel Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleExportExcel();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer shadow-2xs"
            title="Export Student Pipeline to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export As Excel</span>
          </button>

          {/* Refined View Mode Switcher (Blue & Red Theme Border) */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-blue-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-blue-900 shadow-2xs border border-blue-300'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>Card View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-red-900 shadow-2xs border border-red-300'
                  : 'text-slate-600 hover:text-red-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-red-600" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Focus Banner (when user clicked View All on a specific status column) */}
      {focusedStatus && (
        <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>
              Filtered View: Only showing opportunities under{' '}
              <strong className="font-semibold text-slate-900">{focusedStatus.status_name}</strong>
            </span>
          </div>
          <button
            onClick={() => setFocusedStatusId(null)}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show All Stages</span>
          </button>
        </div>
      )}

      {/* Search Bar & Stats */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80" onClick={(e) => e.stopPropagation()}>
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, email, or #OPP-ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50/70 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{statuses.length} Stages</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            <span>{totalOpportunitiesCount} Opportunities</span>
          </span>
          {movingStudent && (
            <span className="flex items-center gap-1 text-slate-700 font-semibold animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* View Mode Switching: Table View or Kanban Card View */}
      {viewMode === 'table' ? (
        /* Refined Corporate Table View */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          {/* Table Top Status Filter Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-slate-50/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Stage:</span>
              <button
                type="button"
                onClick={() => setTableStatusFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  tableStatusFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({totalOpportunitiesCount})
              </button>
              {statuses.map((st) => {
                const isSelected = String(tableStatusFilter) === String(st.status_id);
                const countInStatus = opportunities.filter((o) => o.status_id === st.status_id).length;
                return (
                  <button
                    key={st.status_id}
                    type="button"
                    onClick={() => setTableStatusFilter(st.status_id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st.status_name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {countInStatus}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium shrink-0">
              Showing <span className="font-semibold text-slate-800">{allFilteredOpportunities.length}</span> of {totalOpportunitiesCount} opportunities
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4"># OPP ID</th>
                  <th className="py-3 px-4">Student / Client</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-center">Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {allFilteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No opportunities found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search or stage filter</p>
                    </td>
                  </tr>
                ) : (
                  allFilteredOpportunities.map((opp) => {
                    const oppId = opp.opportunity_id;
                    const student = opp.client || {};
                    const sId = opp.client_id || student.client_id;
                    const studentInitials = getInitials(student.name);

                    const assignedStaff = opp.staff || null;
                    const staffInitials = assignedStaff?.name ? getInitials(assignedStaff.name) : null;
                    const hasNote = Boolean(opp.note_id || opp.note);
                    const channelIcons = getChannelIcons(student.source || '');

                    return (
                      <tr key={oppId} className="hover:bg-slate-50/70 transition-colors">
                        {/* #OPP ID */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70 text-[11px]">
                            #OPP-{oppId}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                              {studentInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{student.name || `Student #${sId}`}</div>
                              <div className="text-[11px] text-slate-400 truncate">{student.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Status / Stage */}
                        <td className="py-3 px-4">
                          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={opp.status_id}
                              onChange={(e) => handleMoveOpportunity(opp, Number(e.target.value))}
                              className="appearance-none font-medium text-xs px-2.5 py-1 pr-6 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                            >
                              {statuses.map((st) => (
                                <option key={st.status_id} value={st.status_id} className="text-slate-800">
                                  {st.status_name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none text-slate-400" />
                          </div>
                        </td>

                        {/* Assigned Staff */}
                        <td className="py-3 px-4">
                          {staffInitials ? (
                            isStaff ? (
                              <div
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80"
                                title={`Assigned to ${assignedStaff?.name}`}
                              >
                                <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-medium text-[9px] flex items-center justify-center shrink-0">
                                  {staffInitials}
                                </div>
                                <span className="font-medium text-slate-700 text-xs truncate max-w-[100px]">
                                  {assignedStaff?.name}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAssignStaffOpp(opp)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all cursor-pointer"
                                title={`Assigned to ${assignedStaff?.name}. Click to change.`}
                              >
                                <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-medium text-[9px] flex items-center justify-center shrink-0">
                                  {staffInitials}
                                </div>
                                <span className="font-medium text-slate-700 text-xs truncate max-w-[100px]">
                                  {assignedStaff?.name}
                                </span>
                              </button>
                            )
                          ) : isStaff ? (
                            <span className="text-xs text-slate-400 font-medium">Unassigned</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssignStaffOpp(opp)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-slate-700 border border-dashed border-slate-300 hover:bg-slate-50 text-xs font-medium transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          )}
                        </td>

                        {/* Lead Source */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-[150px]">
                            {student.source && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate">
                                {student.source}
                              </span>
                            )}
                            {channelIcons.map((ch) => (
                              <div
                                key={ch.id}
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ch.bg}`}
                                title={`Channel: ${ch.title}`}
                              >
                                {ch.icon}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-slate-500 font-normal">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatDate(opp.created_at || student.created_at)}</span>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setNoteModalOpp(opp)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all cursor-pointer ${
                              hasNote
                                ? 'bg-slate-100 text-slate-800 font-semibold border border-slate-300 hover:bg-slate-200'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={hasNote ? 'View Note' : 'Add Note'}
                          >
                            <StickyNote className={`w-3.5 h-3.5 ${hasNote ? 'text-slate-800 fill-slate-700' : 'text-slate-400'}`} />
                            <span>{hasNote ? 'Note' : '+ Note'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                const statusObj = statuses.find((s) => String(s.status_id) === String(opp.status_id));
                                setDetailStudent({
                                  ...student,
                                  opportunity_id: opp.opportunity_id,
                                  status_id: opp.status_id,
                                  status_name: statusObj?.status_name || opp.status_name,
                                  staff_name: opp.staff_name || (opp.staff ? (opp.staff.name || opp.staff.email) : null),
                                  staff: opp.staff,
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Info"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteModalOpp(opp)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Note"
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                            </button>
                            {!isStaff && (
                              <button
                                type="button"
                                onClick={() => setAssignStaffOpp(opp)}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Assign Staff"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Professional Kanban Pipeline Board */
        <div className="overflow-x-auto pb-6 pt-1">
          {apiLoading && columnsData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <Loader2 className="w-7 h-7 text-slate-700 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Loading Pipeline Stages...</p>
            </div>
          ) : columnsData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center p-6">
              <Layers className="w-9 h-9 text-slate-300" />
              <p className="text-sm font-semibold text-slate-800">No Pipeline Stages Configured</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Use "Manage Pipeline" to configure your sales and admission stages.
              </p>
              {!isStaff && (
                <button
                  type="button"
                  onClick={() => setIsManagePipelineOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  Configure Pipeline
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-4 items-start min-w-max">
              {columnsData.map(({ status, opportunities: oppsInStatus, count }, colIndex) => {
                const theme = getStatusTheme(status.status_name, colIndex);
                const isOver = dragOverStatusId === status.status_id;
                const isFocused = focusedStatusId === status.status_id;

                return (
                  <div
                    key={status.status_id}
                    onDragOver={(e) => handleDragOver(e, status.status_id)}
                    onDragLeave={(e) => handleDragLeave(e, status.status_id)}
                    onDrop={(e) => handleDrop(e, status.status_id)}
                    className={`w-80 shrink-0 flex flex-col rounded-2xl border transition-all duration-150 ${
                      isOver
                        ? 'border-slate-400 bg-slate-100/70 shadow-md scale-[1.01]'
                        : 'border-slate-200/80 bg-slate-50/60 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    {/* Clean Column Header */}
                    <div className="p-3.5 pb-2.5 bg-white rounded-t-2xl border-b border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dotBg}`} />
                          <h3 className="font-semibold text-xs text-slate-900 truncate tracking-tight">
                            {status.status_name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.2 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 min-w-[20px] text-center">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedStatusId(isFocused ? null : status.status_id);
                            }}
                            className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${
                              isFocused ? 'text-slate-900 bg-slate-100' : ''
                            }`}
                            title={isFocused ? 'Show all stages' : 'Focus on this stage'}
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-1 truncate">
                        {theme.subtitle}
                      </p>
                    </div>

                    {/* Opportunity Cards List */}
                    <div
                      onDragOver={(e) => handleDragOver(e, status.status_id)}
                      onDrop={(e) => handleDrop(e, status.status_id)}
                      className="p-3 space-y-2.5 min-h-[160px] max-h-[calc(100vh-280px)] overflow-y-auto"
                    >
                      {oppsInStatus.length === 0 ? (
                        <div
                          onDragOver={(e) => handleDragOver(e, status.status_id)}
                          onDrop={(e) => handleDrop(e, status.status_id)}
                          className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all ${
                            isOver
                              ? 'border-slate-400 bg-slate-100/80 text-slate-700'
                              : 'border-slate-200/70 bg-white/40 text-slate-400'
                          }`}
                        >
                          <p className="text-xs font-medium">
                            {isOver ? 'Drop student here' : 'No opportunities'}
                          </p>
                        </div>
                      ) : (
                        oppsInStatus.map((opp) => {
                          const oppId = opp.opportunity_id;
                          const student = opp.client || {};
                          const sId = opp.client_id || student.client_id;
                          const isDragging = draggedOpportunity?.opportunity_id === oppId;
                          const studentInitials = getInitials(student.name);
                          const isMenuOpen = activeMenuOppId === oppId;

                          const assignedStaff = opp.staff || null;
                          const staffInitials = assignedStaff?.name ? getInitials(assignedStaff.name) : null;
                          const hasNote = Boolean(opp.note_id || opp.note);
                          const channelIcons = getChannelIcons(student.source || '');

                          return (
                            <div
                              key={oppId}
                              draggable
                              onDragStart={(e) => handleDragStart(e, opp)}
                              className={`group relative bg-white border border-blue-200/80 hover:border-blue-500 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing space-y-2 ${
                                isDragging ? 'opacity-40 border-dashed border-blue-400' : ''
                              }`}
                            >
                              {/* Top Row: Student Avatar + Name + Staff Badge & Menu */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center text-[11px] font-bold shrink-0 border border-blue-200">
                                    {studentInitials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                      {student.name || `Student #${sId}`}
                                    </h4>
                                  </div>
                                </div>

                                {/* Right: Staff initials (badge for staff, button for admin) & Menu */}
                                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {staffInitials ? (
                                    isStaff ? (
                                      <div
                                        className="w-6 h-6 rounded-full bg-blue-900 text-white font-medium text-[9px] flex items-center justify-center border border-blue-700 shadow-2xs select-none"
                                        title={`Assigned Staff: ${assignedStaff?.name}`}
                                      >
                                        {staffInitials}
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setAssignStaffOpp(opp)}
                                        className="w-6 h-6 rounded-full bg-blue-900 text-white font-medium text-[9px] flex items-center justify-center hover:bg-blue-800 border border-blue-700 shadow-2xs transition-all cursor-pointer"
                                        title={`Assigned Staff: ${assignedStaff?.name}. Click to change.`}
                                      >
                                        {staffInitials}
                                      </button>
                                    )
                                  ) : !isStaff ? (
                                    <button
                                      type="button"
                                      onClick={() => setAssignStaffOpp(opp)}
                                      className="w-6 h-6 rounded-full bg-transparent hover:bg-red-50 text-red-500 hover:text-red-700 border border-dashed border-red-300 flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                      title="Assign Staff"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  ) : null}

                                  {/* Menu */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuOppId(isMenuOpen ? null : oppId);
                                      }}
                                      className="w-5 h-5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </button>

                                    {isMenuOpen && (
                                      <div
                                        className="absolute right-0 top-6 z-30 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const statusObj = statuses.find((s) => String(s.status_id) === String(opp.status_id));
                                              setDetailStudent({
                                                ...student,
                                                opportunity_id: opp.opportunity_id,
                                                status_id: opp.status_id,
                                                status_name: statusObj?.status_name || opp.status_name,
                                                staff_name: opp.staff_name || (opp.staff ? (opp.staff.name || opp.staff.email) : null),
                                                staff: opp.staff,
                                              });
                                              setActiveMenuOppId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-medium"
                                          >
                                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                                          View Student Info
                                        </button>
                                        {!isStaff && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAssignStaffOpp(opp);
                                              setActiveMenuOppId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer font-medium"
                                          >
                                            <UserCheck className="w-3.5 h-3.5 text-red-500" />
                                            Assign Staff
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNoteModalOpp(opp);
                                            setActiveMenuOppId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                                          {hasNote ? 'Edit Note' : 'Add Note'}
                                        </button>

                                        <div className="border-t border-slate-100 my-1 pt-1">
                                          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Move To Stage
                                          </div>
                                          {statuses
                                            .filter((st) => st.status_id !== status.status_id)
                                            .map((targetSt) => (
                                              <button
                                                key={targetSt.status_id}
                                                type="button"
                                                onClick={() => {
                                                  handleMoveOpportunity(opp, targetSt.status_id);
                                                  setActiveMenuOppId(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between cursor-pointer"
                                              >
                                                <span className="truncate">{targetSt.status_name}</span>
                                                <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Middle: #OPP-ID + Source + Date */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs">
                                    #OPP-{oppId}
                                  </span>
                                  {student.source && (
                                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-red-50 text-red-800 border border-red-200 truncate max-w-[130px]">
                                      {student.source}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{formatDate(opp.created_at || student.created_at)}</span>
                                </div>
                              </div>

                              {/* Bottom Bar: Channel Icons + Note Button */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                                <div className="flex items-center gap-1 overflow-hidden">
                                  {channelIcons.length > 0 ? (
                                    channelIcons.map((ch) => (
                                      <div
                                        key={ch.id}
                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ch.bg}`}
                                        title={`Channel: ${ch.title}`}
                                      >
                                        {ch.icon}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      Direct
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNoteModalOpp(opp);
                                  }}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer shrink-0 ${
                                    hasNote
                                      ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100'
                                      : 'border border-blue-200 text-blue-800 hover:bg-blue-50 bg-white'
                                  }`}
                                  title={hasNote ? 'View Note' : 'Add Note'}
                                >
                                  <StickyNote className={`w-3 h-3 ${hasNote ? 'text-amber-600 fill-amber-500' : 'text-blue-500'}`} />
                                  <span>{hasNote ? 'Note' : '+ Note'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ClientAddModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        client={null}
        onClose={() => setIsCreateOppOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      <ClientDetailModal
        isOpen={!!detailStudent}
        client={detailStudent}
        onClose={() => setDetailStudent(null)}
      />

      {!isStaff && (
        <ManagePipelineModal
          isOpen={isManagePipelineOpen}
          onClose={() => setIsManagePipelineOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            handleRefresh();
          }}
        />
      )}

      <OpportunityNoteModal
        isOpen={!!noteModalOpp}
        opportunity={noteModalOpp}
        onClose={() => setNoteModalOpp(null)}
        onSuccess={(msg) => {
          showToast(msg);
          handleRefresh();
        }}
      />

      {!isStaff && (
        <AssignStaffModal
          isOpen={!!assignStaffOpp}
          opportunity={assignStaffOpp}
          onClose={() => setAssignStaffOpp(null)}
          onSuccess={(msg) => {
            showToast(msg);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
