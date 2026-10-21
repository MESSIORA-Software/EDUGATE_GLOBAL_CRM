import React from 'react';
import { X } from 'lucide-react';

const format12H = (val) => {
  if (!val) return '';
  const parts = String(val).split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m.slice(0, 2)} ${ampm}`;
};

export default function TimePicker({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div className="w-full space-y-1">
      <div
        className={`relative flex items-center justify-between bg-white border rounded-xl shadow-2xs transition px-3 py-2 ${
          disabled
            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
            : 'border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
        }`}
      >
        <input
          type="time"
          disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer tracking-wider selection:bg-blue-100"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear time"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition shrink-0 ml-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Clear 12-Hour formatted badge */}
      {value ? (
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>{format12H(value)}</span>
        </div>
      ) : (
        <div className="px-1 text-[10px] text-slate-400">
          Not set (Optional)
        </div>
      )}
    </div>
  );
}
