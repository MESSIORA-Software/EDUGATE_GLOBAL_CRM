import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Search, Check, X, Loader2, UserCheck } from 'lucide-react';
import { fetchUsers } from '../../../../actions/Admin/userActions';
import userService from '../../../../services/Admin/userService';

export default function StaffPicker({ value, onChange, disabled = false }) {
  const dispatch = useDispatch();
  const reduxUsers = useSelector((state) => state.users?.users || []);
  const [localUsers, setLocalUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users if Redux store is empty
  useEffect(() => {
    if (reduxUsers && reduxUsers.length > 0) {
      setLocalUsers(reduxUsers);
    } else {
      setLoading(true);
      userService
        .getAllUsers()
        .then((res) => {
          const raw = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : Array.isArray(res?.users)
            ? res.users
            : [];
          setLocalUsers(raw);
          if (raw.length > 0) {
            dispatch(fetchUsers());
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [reduxUsers, dispatch]);

  const usersList = useMemo(() => {
    const source = (reduxUsers && reduxUsers.length > 0) ? reduxUsers : localUsers;
    return Array.isArray(source) ? source : [];
  }, [reduxUsers, localUsers]);

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return usersList.find(
      (u) => String(u.user_id || u.id) === String(value)
    ) || null;
  }, [value, usersList]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersList;
    const q = searchTerm.toLowerCase();
    return usersList.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role_id || u.role_name || u.role || '').toLowerCase();
      const id = String(u.user_id || u.id || '');
      return name.includes(q) || email.includes(q) || role.includes(q) || id.includes(q);
    });
  }, [usersList, searchTerm]);

  const getRoleBadgeStyle = (roleStr = '') => {
    const r = String(roleStr).toUpperCase();
    if (r.includes('SUPER')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (r.includes('ADMIN')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <style>{`
        .custom-staff-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-staff-scroll::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 9999px;
        }
        .custom-staff-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-staff-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* 1. Search Bar at Top */}
      <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            disabled={disabled}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={loading ? 'Loading staff members...' : 'Search staff by name, email, or role...'}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
              {filteredUsers.length} staff
            </span>
          )}
        </div>
      </div>

      {/* 2. Beautiful Scrollable Staff List Container */}
      <div
        className="max-h-48 overflow-y-scroll custom-staff-scroll p-2 space-y-1.5 overscroll-contain"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f8fafc',
        }}
      >

        {/* Staff Members List */}
        {filteredUsers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
            No matching staff members found
          </div>
        ) : (
          filteredUsers.map((u) => {
            const uId = u.user_id || u.id;
            const isSelected = String(value) === String(uId);
            const roleLabel = u.role_id || u.role_name || u.role || 'STAFF';

            return (
              <div
                key={uId}
                role="button"
                tabIndex={0}
                onClick={() => !disabled && onChange(isSelected ? '' : uId)}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 text-blue-900 font-semibold shadow-2xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-blue-300'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 border border-blue-200 text-blue-700'
                    }`}
                  >
                    {u.name ? u.name.slice(0, 2) : 'ST'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 leading-tight truncate">
                      {u.name || `Staff #${uId}`}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {u.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                      roleLabel
                    )}`}
                  >
                    {roleLabel}
                  </span>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Bottom Active Summary Footer */}
      <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          {selectedUser ? (
            <span className="truncate text-slate-700 font-medium">
              Assigned to: <strong className="text-slate-900 font-semibold">{selectedUser.name}</strong> ({selectedUser.role_id || selectedUser.role_name || 'STAFF'})
            </span>
          ) : (
            <span className="text-slate-400 italic">No staff member currently assigned</span>
          )}
        </div>

        {selectedUser && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
