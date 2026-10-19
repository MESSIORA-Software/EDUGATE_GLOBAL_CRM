import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRole } from '../../../../actions/Admin/roleActions';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import { X, ShieldPlus, AlertCircle } from 'lucide-react';

const generateRoleId = (name) => {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+/, '');
};

export default function RoleAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.roles);

  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleRoleNameChange = (e) => {
    const name = e.target.value;
    setRoleName(name);
    setRoleId(generateRoleId(name));
    if (localError) setLocalError('');
  };

  const handleClose = () => {
    setRoleId('');
    setRoleName('');
    setLocalError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const trimmedName = roleName.trim();
    if (!trimmedName) {
      setLocalError('Role Name is required.');
      return;
    }

    const finalRoleId = trimmedName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!finalRoleId) {
      setLocalError('Please enter a valid role name containing alphanumeric characters.');
      return;
    }

    const res = await dispatch(createRole(finalRoleId, trimmedName));
    if (res.success) {
      setRoleId('');
      setRoleName('');
      setLocalError('');
      onSuccess?.('Role created successfully!');
      onClose();
    } else {
      setLocalError(res.error || 'Failed to create role.');
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-sm w-full overflow-hidden"
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
            onClick={handleClose}
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
              Role Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Education Counselor"
              value={roleName}
              onChange={handleRoleNameChange}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              autoFocus
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={TYPOGRAPHY.label}>
                Role ID <span className="text-[10px] text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                System Key
              </span>
            </div>
            <input
              type="text"
              placeholder="E.G. EDUCATION_COUNSELOR"
              value={roleId}
              readOnly
              disabled
              style={{ backgroundColor: '#F8FAFC', borderColor: COLORS.border, color: roleId ? COLORS.foreground : COLORS.placeholder }}
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold uppercase cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Role ID is automatically generated from the role name and passed to the API.
            </p>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={submitting}>
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
