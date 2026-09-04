import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../actions/Admin/userActions';
import { fetchRoles } from '../../../actions/Admin/roleActions';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Button from '../../ui/Button';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export default function UserAddModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.users);
  const { roles } = useSelector((state) => state.roles);

  const [branchId, setBranchId] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [roleId, setRoleId] = useState(1);
  const [status, setStatus] = useState('ACTIVE');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen && (!roles || roles.length === 0)) {
      dispatch(fetchRoles());
    }
  }, [isOpen, roles, dispatch]);

  useEffect(() => {
    if (roles && roles.length > 0 && !roleId) {
      setRoleId(roles[0].role_id || roles[0].id || 1);
    }
  }, [roles, roleId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('User name is required.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email address is required.');
      return;
    }

    const payload = {
      branch_id: Number(branchId) || 1,
      name: name.trim(),
      email: email.trim(),
      password_hash: passwordHash.trim() || 'hashed_password_123',
      role_id: isNaN(Number(roleId)) ? roleId : Number(roleId),
      status: status,
      created_by: null,
    };

    const res = await dispatch(registerUser(payload));
    if (res.success) {
      setName('');
      setEmail('');
      setPasswordHash('');
      onSuccess?.('User created successfully!');
      onClose();
    } else {
      setLocalError(res.error || 'Failed to create user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-md w-full overflow-hidden"
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Create New User</h3>
              <p className={TYPOGRAPHY.caption}>Add system user account</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {(localError || error) && (
            <div
              style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
              className="flex items-center gap-2 p-2.5 border rounded-xl text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>Branch ID</label>
              <input
                type="number"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <div>
              <label className={`${TYPOGRAPHY.label} block mb-1`}>
                Role ID <span style={{ color: COLORS.secondary }}>*</span>
              </label>
              {roles && roles.length > 0 ? (
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {roles.map((r, i) => (
                    <option key={r.role_id || r.id || i} value={r.role_id || r.id || (i + 1)}>
                      {r.role_id || r.id} - {r.role_name || r.name || 'Role'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              )}
            </div>
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Full Name <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kamal Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Email Address <span style={{ color: COLORS.secondary }}>*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. kamal.perera@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              required
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Password Hash</label>
            <input
              type="text"
              placeholder="e.g. hashed_password_123"
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
