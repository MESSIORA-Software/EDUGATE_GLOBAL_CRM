import React from 'react';
import {
  ExternalLink,
  Edit2,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ChevronRight,
} from 'lucide-react';

const formatCellValue = (val, col) => {
  if (val === null || val === undefined || val === '') {
    return <span className="text-slate-300 select-none">—</span>;
  }

  switch (col.data_type) {
    case 'date':
      return (
        <span className="font-mono text-[11px] text-slate-700 whitespace-nowrap">
          {String(val)}
        </span>
      );

    case 'datetime':
      return (
        <span className="font-mono text-[11px] text-slate-700 whitespace-nowrap">
          {String(val).slice(0, 16).replace('T', ' ')}
        </span>
      );

    case 'boolean':
      return val ? (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-2.5 h-2.5" /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
          <XCircle className="w-2.5 h-2.5" /> No
        </span>
      );

    case 'single_select': {
      const strVal = String(val);
      const isPositive = ['Approved', 'Passed', 'Completed', 'Paid', 'Verified', 'Enrolled', 'Accepted'].some(k =>
        strVal.toLowerCase().includes(k.toLowerCase())
      );
      const isWarning = ['Pending', 'In Progress', 'Under Review', 'Preparing', 'Drafted'].some(k =>
        strVal.toLowerCase().includes(k.toLowerCase())
      );
      const isNegative = ['Rejected', 'Failed', 'Issue Found', 'Discrepancy'].some(k =>
        strVal.toLowerCase().includes(k.toLowerCase())
      );

      let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (isPositive) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      else if (isWarning) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      else if (isNegative) badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border truncate max-w-[180px] ${badgeClass}`}
          title={strVal}
        >
          {strVal}
        </span>
      );
    }

    case 'multi_select':
      if (Array.isArray(val)) {
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {val.map((item, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-slate-600 truncate">{String(val)}</span>;

    case 'url':
      return (
        <a
          href={String(val)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 max-w-[160px] truncate"
          title={String(val)}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{String(val).replace(/^https?:\/\//, '')}</span>
        </a>
      );

    case 'file_ref':
      if (typeof val === 'object' && val !== null) {
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 max-w-[160px] truncate" title={val.original_name}>
            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{val.original_name || 'Attached Document'}</span>
          </span>
        );
      }
      return <span className="truncate max-w-[160px]">{String(val)}</span>;

    case 'currency':
      return (
        <span className="font-mono text-slate-800 font-medium">
          {Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );

    case 'number':
      return <span className="font-mono text-slate-800">{Number(val).toLocaleString()}</span>;

    default:
      return (
        <span className="text-slate-700 truncate max-w-[220px] block" title={String(val)}>
          {String(val)}
        </span>
      );
  }
};

export default function JourneySpreadsheetTable({
  records,
  columns,
  loading,
  onRowClick,
}) {
  const visibleColumns = (columns || []).filter((c) => c.is_visible !== false);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-slate-500">Loading student journey tracking records...</span>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No student journey records found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Try adjusting your search query, assigned staff filter, or date filters to find matching student tracking records.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative max-h-[70vh]">
        <table className="w-full border-collapse text-left text-xs text-slate-600">
          {/* Header Row */}
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-20 shadow-xs border-b border-slate-200">
            <tr>
              {/* Frozen Column 1: Row # */}
              <th className="px-3 py-3 text-center w-12 sticky left-0 z-30 bg-slate-50 border-r border-slate-200">
                #
              </th>

              {/* Frozen Column 2: Student ID */}
              <th className="px-4 py-3 sticky left-12 z-30 bg-slate-50 border-r border-slate-200 whitespace-nowrap min-w-[140px]">
                Student ID
              </th>

              {/* Frozen Column 3: Student Name */}
              <th className="px-4 py-3 sticky left-[188px] z-30 bg-slate-50 border-r border-slate-200 whitespace-nowrap min-w-[180px]">
                Student Name
              </th>

              {/* Frozen Column 4: Assigned Staff */}
              <th className="px-4 py-3 sticky left-[368px] z-30 bg-slate-50 border-r border-slate-200 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap min-w-[160px]">
                Assigned Staff
              </th>

              {/* Dynamic Tracking Columns */}
              {visibleColumns.map((col) => (
                <th
                  key={col.column_id}
                  className="px-4 py-3 whitespace-nowrap border-r border-slate-200/70 font-semibold text-slate-700"
                  style={{ minWidth: Math.max(140, Math.min(260, col.label.length * 9)) }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="truncate" title={col.label}>{col.label}</span>
                    {col.is_required && <span className="text-rose-500 font-bold">*</span>}
                  </div>
                </th>
              ))}

              {/* Action Column */}
              <th className="px-4 py-3 text-center sticky right-0 z-20 bg-slate-50 border-l border-slate-200 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap w-20">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((rec) => (
              <tr
                key={rec.client_id}
                onClick={() => onRowClick && onRowClick(rec)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
              >
                {/* Frozen Column 1: Row # */}
                <td className="px-3 py-2.5 text-center text-slate-400 font-mono text-[11px] sticky left-0 z-10 bg-white group-hover:bg-blue-50/60 border-r border-slate-200/80">
                  {rec.row_number}
                </td>

                {/* Frozen Column 2: Student ID */}
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600 sticky left-12 z-10 bg-white group-hover:bg-blue-50/60 border-r border-slate-200/80 whitespace-nowrap">
                  {rec.student_id}
                </td>

                {/* Frozen Column 3: Student Name */}
                <td className="px-4 py-2.5 font-medium text-slate-900 sticky left-[188px] z-10 bg-white group-hover:bg-blue-50/60 border-r border-slate-200/80 whitespace-nowrap">
                  <div className="truncate max-w-[170px]" title={rec.student_name}>
                    {rec.student_name}
                  </div>
                </td>

                {/* Frozen Column 4: Assigned Staff */}
                <td className="px-4 py-2.5 text-slate-600 sticky left-[368px] z-10 bg-white group-hover:bg-blue-50/60 border-r border-slate-200/80 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                  {rec.assigned_staff ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{rec.assigned_staff.name}</span>
                    </span>
                  ) : (
                    <span className="text-amber-500 text-[11px] font-medium">Unassigned</span>
                  )}
                </td>

                {/* Dynamic Columns */}
                {visibleColumns.map((col) => {
                  const val = rec.values ? rec.values[col.field_key] : undefined;
                  return (
                    <td
                      key={col.column_id}
                      className="px-4 py-2.5 border-r border-slate-100 whitespace-nowrap"
                    >
                      {formatCellValue(val, col)}
                    </td>
                  );
                })}

                {/* Action Column */}
                <td className="px-3 py-2.5 text-center sticky right-0 z-10 bg-white group-hover:bg-blue-50/60 border-l border-slate-200/80 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick && onRowClick(rec);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Edit Student Journey"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
