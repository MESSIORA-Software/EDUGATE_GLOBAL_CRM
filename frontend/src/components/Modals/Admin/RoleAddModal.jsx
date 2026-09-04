import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRole } from '../../../actions/Admin/roleActions';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import { X, ShieldPlus, AlertCircle } from 'lucide-react';

export default function RoleAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.roles);

  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!roleId.trim()) {
      setLocalError('Role ID is required.');
      return;
    }
    if (!roleName.trim()) {
      setLocalError('Role Name is required.');
      return;
    }

    const res = await dispatch(createRole(roleId.trim().toUpperCase(), roleName.trim()));
    if (res.success) {
      setRoleId('');
      setRoleName('');
      onSuccess?.('Role created successfully!');
      onClose();
    } else {
      setLocalError(res.error || 'Failed to create role.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <ShieldPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Add New Role</h3>
              <p className={TYPOGRAPHY.caption}>Create system role entity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {(localError || error) && (
            <div
              style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
              className="flex items-center gap-2 p-2.5 border rounded-xl text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Role ID <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. COUNSELOR"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value.toUpperCase())}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Role Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Education Counselor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Create Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
